import ast
from execute import executeFunction
class Deserializer:
    def __init__(self, jsonString):
        self.jsonString = jsonString
        self.nodes      = jsonString['layers'][1]['models']
        self.links      = jsonString['layers'][0]['models']
        self.inputDict  = {}
        self.funcDict   = {}
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
        self.select = {'Function': self.funcDict, 'Return': self.exit}
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
        masterOutput = []   
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
                    inputVals.append(
                        ast.literal_eval(self.inputDict[self.linkDict[v['links'][0]]['source']]['value'])
                    )
                elif v['label'][0] == 'O':
                    # Output is array of array
                    outputLinks.append(v['links'])
            outputs, prints = executeFunction(functionBody=funtionBody, functionArgs=inputVals)
            # Ignore linking function for now and return directly 
            masterOutput.extend(prints)
            masterOutput.extend(outputs)

        
        while nodes:
            front = nodes.pop(0)
            if (front['name'] == 'Function'):
                # Now we are assuming that there are only one layer of input / outputs,
                # But as we progress there could be multiple layers, ITERATION NEEDED
                parseFunctionNode(front)
            appendOutPortNodes(front)
        return masterOutput




    