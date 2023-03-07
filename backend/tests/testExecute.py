import unittest

from dotenv import load_dotenv
load_dotenv('../.env')

import sys
sys.path.append('../')
from execute import executeFunction

class TestExecute(unittest.TestCase):

    def test_execute(self):
        functionBody = '''# Write your function below
def func(a, b):
    return a + b'''
        functionArgs = [5, 6]
        expected_output = 11
        result = executeFunction(functionBody, functionArgs)[0][0]
        self.assertEqual(result, expected_output)

if __name__ == '__main__':
    unittest.main()