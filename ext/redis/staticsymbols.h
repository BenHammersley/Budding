static struct redisFunctionSym symsTable[] = {
{"IOThreadEntryPoint",(unsigned long)IOThreadEntryPoint},
{"_redisAssert",(unsigned long)_redisAssert},
{"acceptHandler",(unsigned long)acceptHandler},
{"addReply",(unsigned long)addReply},
{"addReplyBulkLen",(unsigned long)addReplyBulkLen},
{"addReplyDouble",(unsigned long)addReplyDouble},
{"addReplySds",(unsigned long)addReplySds},
{"aofRemoveTempFile",(unsigned long)aofRemoveTempFile},
{"appendServerSaveParams",(unsigned long)appendServerSaveParams},
{"authCommand",(unsigned long)authCommand},
{"beforeSleep",(unsigned long)beforeSleep},
{"bgrewriteaofCommand",(unsigned long)bgrewriteaofCommand},
{"bgsaveCommand",(unsigned long)bgsaveCommand},
{"blockClientOnSwappedKeys",(unsigned long)blockClientOnSwappedKeys},
{"blockForKeys",(unsigned long)blockForKeys},
{"blockingPopGenericCommand",(unsigned long)blockingPopGenericCommand},
{"blpopCommand",(unsigned long)blpopCommand},
{"brpopCommand",(unsigned long)brpopCommand},
{"bytesToHuman",(unsigned long)bytesToHuman},
{"call",(unsigned long)call},
{"closeTimedoutClients",(unsigned long)closeTimedoutClients},
{"compareStringObjects",(unsigned long)compareStringObjects},
{"computeObjectSwappability",(unsigned long)computeObjectSwappability},
{"createClient",(unsigned long)createClient},
{"createListObject",(unsigned long)createListObject},
{"createObject",(unsigned long)createObject},
{"createSetObject",(unsigned long)createSetObject},
{"createSharedObjects",(unsigned long)createSharedObjects},
{"createSortOperation",(unsigned long)createSortOperation},
{"createStringObject",(unsigned long)createStringObject},
{"createZsetObject",(unsigned long)createZsetObject},
{"daemonize",(unsigned long)daemonize},
{"dbsizeCommand",(unsigned long)dbsizeCommand},
{"debugCommand",(unsigned long)debugCommand},
{"decrCommand",(unsigned long)decrCommand},
{"decrRefCount",(unsigned long)decrRefCount},
{"decrbyCommand",(unsigned long)decrbyCommand},
{"delCommand",(unsigned long)delCommand},
{"deleteIfSwapped",(unsigned long)deleteIfSwapped},
{"deleteIfVolatile",(unsigned long)deleteIfVolatile},
{"deleteKey",(unsigned long)deleteKey},
{"dictEncObjKeyCompare",(unsigned long)dictEncObjKeyCompare},
{"dictListDestructor",(unsigned long)dictListDestructor},
{"dictObjKeyCompare",(unsigned long)dictObjKeyCompare},
{"dictRedisObjectDestructor",(unsigned long)dictRedisObjectDestructor},
{"dictVanillaFree",(unsigned long)dictVanillaFree},
{"dontWaitForSwappedKey",(unsigned long)dontWaitForSwappedKey},
{"dupClientReplyValue",(unsigned long)dupClientReplyValue},
{"dupStringObject",(unsigned long)dupStringObject},
{"echoCommand",(unsigned long)echoCommand},
{"execCommand",(unsigned long)execCommand},
{"existsCommand",(unsigned long)existsCommand},
{"expandVmSwapFilename",(unsigned long)expandVmSwapFilename},
{"expireCommand",(unsigned long)expireCommand},
{"expireGenericCommand",(unsigned long)expireGenericCommand},
{"expireIfNeeded",(unsigned long)expireIfNeeded},
{"expireatCommand",(unsigned long)expireatCommand},
{"feedAppendOnlyFile",(unsigned long)feedAppendOnlyFile},
{"findFuncName",(unsigned long)findFuncName},
{"flushallCommand",(unsigned long)flushallCommand},
{"flushdbCommand",(unsigned long)flushdbCommand},
{"freeClient",(unsigned long)freeClient},
{"freeClientArgv",(unsigned long)freeClientArgv},
{"freeClientMultiState",(unsigned long)freeClientMultiState},
{"freeFakeClient",(unsigned long)freeFakeClient},
{"freeHashObject",(unsigned long)freeHashObject},
{"freeIOJob",(unsigned long)freeIOJob},
{"freeListObject",(unsigned long)freeListObject},
{"freeMemoryIfNeeded",(unsigned long)freeMemoryIfNeeded},
{"freeSetObject",(unsigned long)freeSetObject},
{"freeStringObject",(unsigned long)freeStringObject},
{"freeZsetObject",(unsigned long)freeZsetObject},
{"fwriteBulk",(unsigned long)fwriteBulk},
{"fwriteBulkDouble",(unsigned long)fwriteBulkDouble},
{"fwriteBulkLong",(unsigned long)fwriteBulkLong},
{"genRedisInfoString",(unsigned long)genRedisInfoString},
{"getCommand",(unsigned long)getCommand},
{"getDecodedObject",(unsigned long)getDecodedObject},
{"getExpire",(unsigned long)getExpire},
{"getGenericCommand",(unsigned long)getGenericCommand},
{"getMcontextEip",(unsigned long)getMcontextEip},
{"getsetCommand",(unsigned long)getsetCommand},
{"glueReplyBuffersIfNeeded",(unsigned long)glueReplyBuffersIfNeeded},
{"handleClientsBlockedOnSwappedKey",(unsigned long)handleClientsBlockedOnSwappedKey},
{"handleClientsWaitingListPush",(unsigned long)handleClientsWaitingListPush},
{"htNeedsResize",(unsigned long)htNeedsResize},
{"incrCommand",(unsigned long)incrCommand},
{"incrDecrCommand",(unsigned long)incrDecrCommand},
{"incrRefCount",(unsigned long)incrRefCount},
{"incrbyCommand",(unsigned long)incrbyCommand},
{"infoCommand",(unsigned long)infoCommand},
{"initClientMultiState",(unsigned long)initClientMultiState},
{"initServer",(unsigned long)initServer},
{"initServerConfig",(unsigned long)initServerConfig},
{"isStringRepresentableAsLong",(unsigned long)isStringRepresentableAsLong},
{"keysCommand",(unsigned long)keysCommand},
{"lastsaveCommand",(unsigned long)lastsaveCommand},
{"lindexCommand",(unsigned long)lindexCommand},
{"llenCommand",(unsigned long)llenCommand},
{"loadServerConfig",(unsigned long)loadServerConfig},
{"lockThreadedIO",(unsigned long)lockThreadedIO},
{"lookupKey",(unsigned long)lookupKey},
{"lookupKeyByPattern",(unsigned long)lookupKeyByPattern},
{"lookupKeyRead",(unsigned long)lookupKeyRead},
{"lookupKeyWrite",(unsigned long)lookupKeyWrite},
{"lpopCommand",(unsigned long)lpopCommand},
{"lpushCommand",(unsigned long)lpushCommand},
{"lrangeCommand",(unsigned long)lrangeCommand},
{"lremCommand",(unsigned long)lremCommand},
{"lsetCommand",(unsigned long)lsetCommand},
{"ltrimCommand",(unsigned long)ltrimCommand},
{"mgetCommand",(unsigned long)mgetCommand},
{"monitorCommand",(unsigned long)monitorCommand},
{"moveCommand",(unsigned long)moveCommand},
{"msetCommand",(unsigned long)msetCommand},
{"msetGenericCommand",(unsigned long)msetGenericCommand},
{"msetnxCommand",(unsigned long)msetnxCommand},
{"multiCommand",(unsigned long)multiCommand},
{"oom",(unsigned long)oom},
{"pingCommand",(unsigned long)pingCommand},
{"popGenericCommand",(unsigned long)popGenericCommand},
{"processCommand",(unsigned long)processCommand},
{"processInputBuffer",(unsigned long)processInputBuffer},
{"pushGenericCommand",(unsigned long)pushGenericCommand},
{"qsortCompareSetsByCardinality",(unsigned long)qsortCompareSetsByCardinality},
{"queueIOJob",(unsigned long)queueIOJob},
{"queueMultiCommand",(unsigned long)queueMultiCommand},
{"randomkeyCommand",(unsigned long)randomkeyCommand},
{"rdbLoad",(unsigned long)rdbLoad},
{"rdbLoadDoubleValue",(unsigned long)rdbLoadDoubleValue},
{"rdbLoadIntegerObject",(unsigned long)rdbLoadIntegerObject},
{"rdbLoadLen",(unsigned long)rdbLoadLen},
{"rdbLoadLzfStringObject",(unsigned long)rdbLoadLzfStringObject},
{"rdbLoadObject",(unsigned long)rdbLoadObject},
{"rdbLoadStringObject",(unsigned long)rdbLoadStringObject},
{"rdbLoadTime",(unsigned long)rdbLoadTime},
{"rdbLoadType",(unsigned long)rdbLoadType},
{"rdbRemoveTempFile",(unsigned long)rdbRemoveTempFile},
{"rdbSave",(unsigned long)rdbSave},
{"rdbSaveBackground",(unsigned long)rdbSaveBackground},
{"rdbSaveDoubleValue",(unsigned long)rdbSaveDoubleValue},
{"rdbSaveLen",(unsigned long)rdbSaveLen},
{"rdbSaveLzfStringObject",(unsigned long)rdbSaveLzfStringObject},
{"rdbSaveObject",(unsigned long)rdbSaveObject},
{"rdbSaveStringObject",(unsigned long)rdbSaveStringObject},
{"rdbSaveStringObjectRaw",(unsigned long)rdbSaveStringObjectRaw},
{"rdbSaveTime",(unsigned long)rdbSaveTime},
{"rdbSaveType",(unsigned long)rdbSaveType},
{"rdbSavedObjectLen",(unsigned long)rdbSavedObjectLen},
{"rdbSavedObjectPages",(unsigned long)rdbSavedObjectPages},
{"rdbTryIntegerEncoding",(unsigned long)rdbTryIntegerEncoding},
{"readQueryFromClient",(unsigned long)readQueryFromClient},
{"redisLog",(unsigned long)redisLog},
{"removeExpire",(unsigned long)removeExpire},
{"renameCommand",(unsigned long)renameCommand},
{"renameGenericCommand",(unsigned long)renameGenericCommand},
{"renamenxCommand",(unsigned long)renamenxCommand},
{"replicationFeedSlaves",(unsigned long)replicationFeedSlaves},
{"resetClient",(unsigned long)resetClient},
{"resetServerSaveParams",(unsigned long)resetServerSaveParams},
{"rewriteAppendOnlyFile",(unsigned long)rewriteAppendOnlyFile},
{"rewriteAppendOnlyFileBackground",(unsigned long)rewriteAppendOnlyFileBackground},
{"rpopCommand",(unsigned long)rpopCommand},
{"rpoplpushcommand",(unsigned long)rpoplpushcommand},
{"rpushCommand",(unsigned long)rpushCommand},
{"saddCommand",(unsigned long)saddCommand},
{"saveCommand",(unsigned long)saveCommand},
{"scardCommand",(unsigned long)scardCommand},
{"sdiffCommand",(unsigned long)sdiffCommand},
{"sdiffstoreCommand",(unsigned long)sdiffstoreCommand},
{"sdsDictKeyCompare",(unsigned long)sdsDictKeyCompare},
{"segvHandler",(unsigned long)segvHandler},
{"selectCommand",(unsigned long)selectCommand},
{"selectDb",(unsigned long)selectDb},
{"sendBulkToSlave",(unsigned long)sendBulkToSlave},
{"sendReplyToClient",(unsigned long)sendReplyToClient},
{"sendReplyToClientWritev",(unsigned long)sendReplyToClientWritev},
{"serverCron",(unsigned long)serverCron},
{"setCommand",(unsigned long)setCommand},
{"setExpire",(unsigned long)setExpire},
{"setGenericCommand",(unsigned long)setGenericCommand},
{"setnxCommand",(unsigned long)setnxCommand},
{"setupSigSegvAction",(unsigned long)setupSigSegvAction},
{"shutdownCommand",(unsigned long)shutdownCommand},
{"sinterCommand",(unsigned long)sinterCommand},
{"sinterGenericCommand",(unsigned long)sinterGenericCommand},
{"sinterstoreCommand",(unsigned long)sinterstoreCommand},
{"sismemberCommand",(unsigned long)sismemberCommand},
{"slaveofCommand",(unsigned long)slaveofCommand},
{"smoveCommand",(unsigned long)smoveCommand},
{"sortCommand",(unsigned long)sortCommand},
{"sortCompare",(unsigned long)sortCompare},
{"spawnIOThread",(unsigned long)spawnIOThread},
{"spopCommand",(unsigned long)spopCommand},
{"srandmemberCommand",(unsigned long)srandmemberCommand},
{"sremCommand",(unsigned long)sremCommand},
{"stringObjectLen",(unsigned long)stringObjectLen},
{"sunionCommand",(unsigned long)sunionCommand},
{"sunionDiffGenericCommand",(unsigned long)sunionDiffGenericCommand},
{"sunionstoreCommand",(unsigned long)sunionstoreCommand},
{"syncCommand",(unsigned long)syncCommand},
{"syncRead",(unsigned long)syncRead},
{"syncReadLine",(unsigned long)syncReadLine},
{"syncWithMaster",(unsigned long)syncWithMaster},
{"syncWrite",(unsigned long)syncWrite},
{"tryFreeOneObjectFromFreelist",(unsigned long)tryFreeOneObjectFromFreelist},
{"tryObjectEncoding",(unsigned long)tryObjectEncoding},
{"tryObjectSharing",(unsigned long)tryObjectSharing},
{"tryResizeHashTables",(unsigned long)tryResizeHashTables},
{"ttlCommand",(unsigned long)ttlCommand},
{"typeCommand",(unsigned long)typeCommand},
{"unblockClientWaitingData",(unsigned long)unblockClientWaitingData},
{"unlockThreadedIO",(unsigned long)unlockThreadedIO},
{"updateSlavesWaitingBgsave",(unsigned long)updateSlavesWaitingBgsave},
{"vmCanSwapOut",(unsigned long)vmCanSwapOut},
{"vmCancelThreadedIOJob",(unsigned long)vmCancelThreadedIOJob},
{"vmFindContiguousPages",(unsigned long)vmFindContiguousPages},
{"vmFreePage",(unsigned long)vmFreePage},
{"vmGenericLoadObject",(unsigned long)vmGenericLoadObject},
{"vmInit",(unsigned long)vmInit},
{"vmLoadObject",(unsigned long)vmLoadObject},
{"vmMarkPageFree",(unsigned long)vmMarkPageFree},
{"vmMarkPageUsed",(unsigned long)vmMarkPageUsed},
{"vmMarkPagesFree",(unsigned long)vmMarkPagesFree},
{"vmMarkPagesUsed",(unsigned long)vmMarkPagesUsed},
{"vmPreviewObject",(unsigned long)vmPreviewObject},
{"vmReadObjectFromSwap",(unsigned long)vmReadObjectFromSwap},
{"vmReopenSwapFile",(unsigned long)vmReopenSwapFile},
{"vmSwapObjectBlocking",(unsigned long)vmSwapObjectBlocking},
{"vmSwapObjectThreaded",(unsigned long)vmSwapObjectThreaded},
{"vmSwapOneObject",(unsigned long)vmSwapOneObject},
{"vmSwapOneObjectBlocking",(unsigned long)vmSwapOneObjectBlocking},
{"vmSwapOneObjectThreaded",(unsigned long)vmSwapOneObjectThreaded},
{"vmThreadedIOCompletedJob",(unsigned long)vmThreadedIOCompletedJob},
{"vmWriteObjectOnSwap",(unsigned long)vmWriteObjectOnSwap},
{"waitEmptyIOJobsQueue",(unsigned long)waitEmptyIOJobsQueue},
{"waitForSwappedKey",(unsigned long)waitForSwappedKey},
{"yesnotoi",(unsigned long)yesnotoi},
{"zaddCommand",(unsigned long)zaddCommand},
{"zaddGenericCommand",(unsigned long)zaddGenericCommand},
{"zcardCommand",(unsigned long)zcardCommand},
{"zincrbyCommand",(unsigned long)zincrbyCommand},
{"zrangeCommand",(unsigned long)zrangeCommand},
{"zrangeGenericCommand",(unsigned long)zrangeGenericCommand},
{"zrangebyscoreCommand",(unsigned long)zrangebyscoreCommand},
{"zremCommand",(unsigned long)zremCommand},
{"zremrangebyscoreCommand",(unsigned long)zremrangebyscoreCommand},
{"zrevrangeCommand",(unsigned long)zrevrangeCommand},
{"zscoreCommand",(unsigned long)zscoreCommand},
{"zslCreate",(unsigned long)zslCreate},
{"zslCreateNode",(unsigned long)zslCreateNode},
{"zslDelete",(unsigned long)zslDelete},
{"zslFirstWithScore",(unsigned long)zslFirstWithScore},
{"zslFree",(unsigned long)zslFree},
{"zslFreeNode",(unsigned long)zslFreeNode},
{"zslInsert",(unsigned long)zslInsert},
{"zslRandomLevel",(unsigned long)zslRandomLevel},
{NULL,0}
};