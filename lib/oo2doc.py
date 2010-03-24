#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
oo2doc is a small module that helps with creation of MSWord documents
using PyUNO brigde.
Note that OpenOffice should be running as a background process.
In MacOS X, open Terminal.app and type:
/Applications/OpenOffice.org.app/Contents/program/soffice -accept="socket,host=localhost,port=2002;urp;StarOffice.ServiceManager" -norestore -nofirstwizard -nologo -headless
Assuming your OpenOffice app is under Applications' directory.

USAGE: Invoke oo2doc.py in the shell passing any of the following
optional arguments.
    --title
        Title of document.
    --summary
        A short summary of the document.
    --teaser
        A teaser for the document.
    --story
        The complete copy of the document
    --locations
        Locations metadata.
    --people
        People metadata.
    --companies
        Companies metadata.
    --keywords
        Keywords metadata
    --language
        The language the document was written in.
    -h
        Show this help panel.

Copyright (c) 2010 Rafael Valverde.
"""

import sys

# TODO: Remove hardcoded path to PyUNO
# In Ubuntu (Linux in general) it doesn't really matter since uno and pyuno
# are available in PYTHONPATH
PYUNO_LIB_LOCATION = "/Applications/OpenOffice.org.app/Contents/basis-link/program"
sys.path.append(PYUNO_LIB_LOCATION)

import uno
import unohelper
import time

from os import path
from com.sun.star.text.ControlCharacter import PARAGRAPH_BREAK
from com.sun.star.beans import PropertyValue

def filename():
    rand = int(time.time())
    return path.join("..", "tmp", "%s.doc" % rand)

def create_document(title="Untitled", summary="", teaser="", story="", locations="",
                    people="", companies="", keywords="", language=""):
    doc = locals().copy()

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
        if doc.get(section):
            input_ = "%s: %s" % (section.capitalize(), doc[section])
            text.insertString(cursor, input_, 0)
            text.insertControlCharacter(cursor, PARAGRAPH_BREAK, 0)

    output = "file://%s" % path.abspath(filename())
    document.storeAsURL(output, (doc_properties,))
    document.dispose()
    sys.stdout.write(output[7:])

def usage():
    print(__doc__)

if __name__ == "__main__":
    import getopt
    arg_opts = """title short_summary teaser story locations people companies
                keywords language""".split()
    arg_opts = ["%s=" % opt for opt in arg_opts]
    opts_list, args = getopt.getopt(sys.argv[1:], "h", arg_opts)
    if not opts_list or ("-h", "") in opts_list:
        usage()
    else:
        remove_prefix = lambda item: (item[0].replace("--", ""), item[1])
        data = dict(map(remove_prefix, opts_list))
        print(create_document(**data))
