import inspect
import sys
class ListStream:
    def __init__(self):
        self.data = []
    def write(self, s):
        self.data.append(s)

def executeFunction(functionBody, functionArgs):
    fcopy = functionBody
    def parseFunctionName():
        funcName = ''
        body = fcopy.split('def ')[1]
        for i in body:
            if i == '(':
                break
            funcName += i
        return funcName
    file = open('temp.py', 'w')
    file.write(functionBody)
    file.close()
    
    import temp
    functionCall = getattr(temp, parseFunctionName())
    sys.stdout = printStatms = ListStream()
    print(inspect.getargspec(functionCall).args)
    return [functionCall(*functionArgs)], printStatms.data