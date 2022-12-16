import ast
from execute import executeFunction
import fileClient
import cognitiveClient
class Deserializer:
    def __init__(self, jsonString, uid):
        self.jsonString = jsonString
        self.uid        = uid
        self.nodes      = jsonString['layers'][1]['models']
        self.links      = jsonString['layers'][0]['models']
        self.inputDict  = {}
        self.funcDict   = {}
        self.cvDict     = {}
        self.nlpDict    = {}
        self.customDict = {}
        self.outputDict = {}
        self.linkDict   = {}
        self.entry      = {}
        self.exit       = {}
        self.select     = {}
        self.print      = {}
        # print(self.nodes)
    def parseAllNodes(self):
        for k, v in self.nodes.items():
            if v['name'] == 'Parameter':
                self.inputDict[k] = {
                    'name': v['name'], 
                    'type': v['type'],
                    'value': v['value'],
                    'ports': v['ports'],
                }
            elif v['name'] == 'Function':
                self.funcDict[k] = {
                    'name': v['name'], 
                    'functionInputs': v['functionInputs'],
                    'functionOutputs': v['functionOutputs'],
                    'functionBody': v['functionBody'],
                    'ports': v['ports']
                }
            elif v['name'] == 'Computer Vision':
                self.cvDict[k] = {
                    'name': v['name'], 
                    'cvFunction': v['cvFunction'],
                    'ports': v['ports']
                }
            elif v['name'] == 'Natural Language Processing':
                self.nlpDict[k] = {
                    'name': v['name'], 
                    'nlpFunction': v['nlpFunction'],
                    'ports': v['ports']
                }
            elif v['name'] == 'Output':
                self.outputDict[k] = {v['name']}
            elif v['name'] == 'Return':
                self.exit = {k : 
                {
                    'name': v['name'], 
                    'ports': v['ports']
                }}
            elif v['name'] == 'Entry Point':
                self.entry = {
                    'name': v['name'], 
                    'ports': v['ports']
                }
            elif v['name'] == 'Print':
                self.print[k] = {
                    'name': v['name'], 
                    'ports': v['ports']
                }
            elif v['name'] == 'Custom CV':
                self.customDict[k] = {
                    'name': v['name'], 
                    'tagList': v['tagList'],
                    'ports': v['ports']
                }
        self.select = {'Function': self.funcDict, 'Return': self.exit, 'Computer Vision': self.cvDict, 'Natural Language Processing': self.nlpDict, 'Custom CV': self.customDict}

    def parseAllLinks(self):
        for k, v in self.links.items():
            self.linkDict[k] = {
                'source': v['source'], 
                'sourcePort': v['sourcePort'], 
                'target': v['target'], 
                'targetPort': v['targetPort']
            }

    def linkNodes(self):
        self.parseAllLinks()
        self.parseAllNodes() 
        # try:
        #     self.parseAllLinks()
        #     self.parseAllNodes() 
        # except:
        #     return '\nError Parsing Node/Link, please check node linking or value settings.', None
        masterOutput = ['>>> PRINT VALUES <<<: \n', '>>> RETURN VALUES <<<: \n']
        imageData = [None]
        nodes = [self.entry]
        def appendOutPortNodes(node): 
            for v in node['ports']:
                if v['label'] == 'Exec Out':
                    for link in v['links']:
                        targetNodeID = self.linkDict[link]['target']
                        nodes.append(self.select[self.nodes[targetNodeID]['name']][targetNodeID])
                    break
        def parseFunctionNode(node):
            # funtionInputsTypes = node['functionInputs']
            # funtionOutputTypes = node['functionOutputs']
            funtionBody = node['functionBody']
            inputVals = []
            outputLinks = []
            for v in node['ports']:
                if v['label'][0] == 'I':
                    # Input is array
                    if self.inputDict[self.linkDict[v['links'][0]]['source']]['type'] != 'file':
                        inputVals.append(
                            ast.literal_eval(self.inputDict[self.linkDict[v['links'][0]]['source']]['value'])
                        )
                    else:
                        fileName = self.inputDict[self.linkDict[v['links'][0]]['source']]['value']
                        inputVals.append(
                            fileClient.downloadFileWithName(uid=self.uid, fileName=fileName)
                        )
                elif v['label'][0] == 'O':
                    # Output is array of array
                    outputLinks.append(v['links'])
            outputs, prints = executeFunction(functionBody=funtionBody, functionArgs=inputVals)
            # Ignore linking function for now and return directly 
            masterOutput[0] += prints
            for i in outputs: 
                masterOutput[1] += '> ' + str(i) + '\n'
            # masterOutput.extend(outputs)
        
        def parseCVNode(node):
            functionType = node['cvFunction']
            inputVal, outputVal = None, None
            outputLink = None

            for v in node['ports']:
                if v['name'] == 'Image':
                    if functionType == 'GetTags - from URL':
                        inputVal = ast.literal_eval(self.inputDict[self.linkDict[v['links'][0]]['source']]['value'])
                        outputVal = cognitiveClient.getTagsOfImage(inputVal)
                    elif functionType == 'GetDescription - from URL':
                        inputVal = ast.literal_eval(self.inputDict[self.linkDict[v['links'][0]]['source']]['value'])
                        outputVal = cognitiveClient.getTextDescriptionOfImage(inputVal)
                    elif functionType == 'GetText - from URL':
                        inputVal = ast.literal_eval(self.inputDict[self.linkDict[v['links'][0]]['source']]['value'])
                        outputVal, imageData[0] = cognitiveClient.getTextOfImage(inputVal)
                    elif functionType == 'GetText - from File':
                        inputVal = self.inputDict[self.linkDict[v['links'][0]]['source']]['value']
                        outputVal, imageData[0] = cognitiveClient.getTextOfImageFromFile(self.uid, inputVal)
                    elif functionType == 'GetTags - from File':
                        inputVal = self.inputDict[self.linkDict[v['links'][0]]['source']]['value']
                        outputVal = cognitiveClient.getTagsOfImageFromFile(self.uid, inputVal)
                    elif functionType == 'GetDescription - from File':
                        inputVal = self.inputDict[self.linkDict[v['links'][0]]['source']]['value']
                        outputVal = cognitiveClient.getTextDescriptionOfImageFromFile(self.uid, inputVal)
                elif v['name'] == 'Output':
                    outputLink = v['links']
            
            masterOutput[1] += outputVal
            return

        def parseNLPNode(node):
            functionType = node['nlpFunction']
            inputVal, outputVal = None, None
            outputLink = None
            for v in node['ports']:
                if v['name'] == 'Text':
                    if functionType == 'GetSentiment - from List':
                        inputVal = ast.literal_eval(self.inputDict[self.linkDict[v['links'][0]]['source']]['value'])
                        outputVal = cognitiveClient.getSentimentOfList(inputVal)
                    elif functionType == 'GetSummarization - from List':
                        inputVal = ast.literal_eval(self.inputDict[self.linkDict[v['links'][0]]['source']]['value'])
                        outputVal = cognitiveClient.getExtractiveSummarizationOfList(inputVal)
                    elif functionType == 'GetKeyPhrase - from List':
                        inputVal = ast.literal_eval(self.inputDict[self.linkDict[v['links'][0]]['source']]['value'])
                        outputVal = cognitiveClient.getKeyPhraseFromList(inputVal)
                    elif functionType == 'GetSentiment - from File':
                        inputVal = self.inputDict[self.linkDict[v['links'][0]]['source']]['value']
                        outputVal = cognitiveClient.getSentimentOfFile(self.uid, inputVal)
                    elif functionType == 'GetSummarization - from File':
                        inputVal = self.inputDict[self.linkDict[v['links'][0]]['source']]['value']
                        outputVal = cognitiveClient.getExtractiveSummarizationOfFile(self.uid, inputVal)
                    elif functionType == 'GetKeyPhrase - from File':
                        inputVal = self.inputDict[self.linkDict[v['links'][0]]['source']]['value']
                        outputVal = cognitiveClient.getKeyPhraseFromFile(self.uid, inputVal)
                elif v['name'] == 'Output':
                    outputLink = v['links']
            
            masterOutput[1] += outputVal
            return            

        def parseCustomCVNode(node):
            tagList = node['tagList']
            testingImage = ''
            outputLink = None
            for v in node['ports']:
                if v['name'] == 'Testing Image':
                    testingImage = self.inputDict[self.linkDict[v['links'][0]]['source']]['value']
                elif v['name'] == 'Output':
                    outputLink = v['links']

            outputVal = cognitiveClient.trainCustomCV(self.uid, tagList, testingImage)
            masterOutput[1] += outputVal
            return   
        
        while nodes:
            front = nodes.pop(0)
            if (front['name'] == 'Function'):
                # Now we are assuming that there are only one layer of input / outputs,
                # But as we progress there could be multiple layers, ITERATION NEEDED
                try:
                    parseFunctionNode(front)
                except:
                    return '\nError parsing Function Node, please check function syntax or node values.', None
            elif (front['name'] == 'Computer Vision'):
                try:
                    parseCVNode(front)
                except:
                    return '\nError parsing CV Node, please check node values.', None
            elif (front['name'] == 'Natural Language Processing'):
                try:
                    parseNLPNode(front)
                except:
                    return '\nError parsing NLP Node, please check node values.', None
            elif (front['name'] == 'Custom CV'):
                try:
                    parseCustomCVNode(front)
                except:
                    return '\nError parsing Custom CV Node, please check node values.', None
            try:
                appendOutPortNodes(front)
            except:
                return '\nError linking nodes, please check node links.', None
        return '\n'.join(masterOutput), imageData[0]




    