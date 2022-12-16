import inspect
import sys
import temp

from importlib import reload

class ListStream:
    def __init__(self):
        self.data = '> '
        self.seeEnd = False
    def write(self, s):
        if s == '\n': 
            self.seeEnd = True
        elif self.seeEnd:
            self.data += '> '
            self.seeEnd = False
        self.data += s

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
    sys.stderr = printStatms
    functionCall = getattr(temp, parseFunctionName())
    # print(inspect.getargspec(functionCall).args)
    res = [functionCall(*functionArgs)]
    sys.stdout = sys.__stdout__
    return res, printStatms.data