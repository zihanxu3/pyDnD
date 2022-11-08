class Deserializer:
    def __init__(self, jsonString):
        self.jsonString = jsonString
        self.nodes = jsonString['layers'][1]['models']
        self.links = jsonString['layers'][0]['models']
        self.inputArr = []
        self.funcArr = []
        self.outputArr = []
        self.links = []
        # print(self.nodes)
    def parseAllNodes(self):
        print(type(self.nodes))
        for _, v in self.nodes.items():
            if v['name'] == 'Parameter':
                self.inputArr.append(v)
            elif v['name'] == 'Function':
                self.funcArr.append(v)
            elif v['name'] == 'Output':
                self.outputArr.append(v)
    


    