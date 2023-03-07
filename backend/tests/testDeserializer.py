import unittest


from dotenv import load_dotenv
load_dotenv('../.env')

import sys
sys.path.append('../')
from deserialize import Deserializer

class TestLinkNodes(unittest.TestCase):

    def test_link_nodes(self):
        jsonString = {
            "layers": [
                {
                    "models": {
                        "link-1": {
                            "source": "e0",
                            "sourcePort": "out",
                            "target": "a1",
                            "targetPort": "in",
                        },
                        "link-2": {
                            "source": "a1",
                            "sourcePort": "out",
                            "target": "b2",
                            "targetPort": "in",
                        },
                        "link-3": {
                            "source": "b2",
                            "sourcePort": "out",
                            "target": "c3",
                            "targetPort": "in",
                        },
                        "link-4": {
                            "source": "a1",
                            "sourcePort": "out",
                            "target": "c3",
                            "targetPort": "in",
                        },
                        "link-5": {
                            "source": "c3",
                            "sourcePort": "out",
                            "target": "output-1",
                            "targetPort": "in",
                        }
                    },
                },
                {
                    "models": {
                        "e0": {
                            "name": "Entry Point",
                            "ports": [{
                                "id": "out",
                                "links": []}]
                        },
                    },
                }
            ]
        }
        uid = ""
        deserializer = Deserializer(jsonString, uid)
        result, error = deserializer.linkNodes()
        expected_output = '\nError linking nodes, please check node links.'
        expected_error = None
        self.assertEqual(result, expected_output)
        self.assertEqual(error, expected_error)

if __name__ == '__main__':
    unittest.main()