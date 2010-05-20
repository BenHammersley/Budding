import yaml

from os import path
from hashlib import md5
from string import printable as CHARACTERS
from random import choice

from sqlalchemy import Table, MetaData, create_engine
from sqlalchemy.orm.session import Session
from sqlalchemy.orm.query import Query
from sqlalchemy.orm import mapper

from com.sun.star.text.ControlCharacter import PARAGRAPH_BREAK
from com.sun.star.beans import PropertyValue

BUDDING_ROOT = path.abspath(path.join(path.dirname(path.abspath(__file__)),
                                      "..", "..", ".."))
DBPARAMS = yaml.load(open(path.join(BUDDING_ROOT, "conf", "database.yml")))

CONNECTION_STRING = "%s://%s:%s@%s/%s" % (DBPARAMS["adapter"],
                                          DBPARAMS["username"],
                                          DBPARAMS["password"],
                                          DBPARAMS["hostname"],
                                          DBPARAMS["database"],
                                          )
engine = create_engine(CONNECTION_STRING)
meta = MetaData(bind=engine)
documents = Table("documents", meta, autoload=True)
languages = Table("languages", meta, autoload=True)

class Document(object):
    pass

class Language(object):
    pass

mapper(Document, documents)
mapper(Language, languages)

class TooManyCollisions(Exception):
    pass

class DocExporter:
    queue = "doc_export"
    def __init__(self, document):
        self.document = document

    def save(self):
        localContext = uno.getComponentContext()
        resolver = localContext.ServiceManager.createInstanceWithContext(
                    "com.sun.star.bridge.UnoUrlResolver", localContext)
        ctx = resolver.resolve("uno:socket,host=localhost,port=2002;" \
                                "urp;StarOffice.ComponentContext")
        smgr = ctx.ServiceManager
        desktop = smgr.createInstanceWithContext("com.sun.star.frame.Desktop",
                                                 ctx)
        document = desktop.loadComponentFromURL("private:factory/swriter",
                                                "_blank", 0, ())
        doc_properties = PropertyValue()
        doc_properties.Name = "FilterName"
        doc_properties.Value = "MS Word 97"
        text = document.Text
        cursor = text.createTextCursor()

        sections = """title short_summary teaser story locations people companies
                    keywords language""".split()
        for section in sections:
            if hasattr(self.document, section):
                input_ = "%s: %s" % (section.capitalize(),
                                     getattr(self.document, section))
                text.insertString(cursor, input_, 0)
                text.insertControlCharacter(cursor, PARAGRAPH_BREAK, 0)
        output = self._filename()
        document.storeAsURL("file://%s" % output, (doc_properties,))
        document.dispose()
        return output

    def _filename():
        hashkey = "%s:%s" % (self.document.title, self.document.document_id)
        filename = "%s.doc" % (md5(hashkey).hexdigest(),)
        path = path.join(BUDDING_ROOT, filename)
        randomfactor = 0
        # Treat collisions
        while path.isfile(path):
            length = len(self.document.title)
            lowerbound = choice(range(length))
            if lowerbound == length - 1:
                lowerbound = 0
            upperbound = choice(range(lowerbound + 1, length))
            title = self.document.title[lowerbound:upperbound]
            hashkey = "%s:%s:%s" % (title, self.document.document_id,
                                    CHARACTERS[:j])
            filename = "%s.doc" % (md5(hashkey).hexdigest(),)
            path = path.join(BUDDING_ROOT, filename)
            randomfactor += 1
            if randomfactor == len(CHARACTERS):
                raise TooManyCollisions
        return path

    @staticmethod
    def perform(doc_id):
        connection = engine.connect()
        session = Session(bind=connection)
        doc = session.query(Document).\
                        filter(documents.c.document_id==doc_id).one()
        lang = session.query(Language).\
                filter(languages.c.language_id == doc.language_id).one()
        setattr(doc, "language", lang.name)

        filename = DocExporter(doc).save()
        db = Redis()
        db.set("Budding::v1::DocExport:%s" % doc_id, filename)


if __name__ == "__main__":
    # Set up a worker if module is invoked (instead of imported)
    from pyres.worker import Worker
    Worker.run(["doc_export"])
