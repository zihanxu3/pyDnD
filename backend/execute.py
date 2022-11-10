import inspect
import sys
import temp

from importlib import reload

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

    reload(temp)
    sys.stdout = printStatms = ListStream()
    functionCall = getattr(temp, parseFunctionName())
    sys.stdout = sys.__stdout__
    print(inspect.getargspec(functionCall).args)
    return [functionCall(*functionArgs)], []