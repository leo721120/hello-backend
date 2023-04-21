Feature: POST

    Background:

        Given new environment

    Scenario: /events, 200

        Given url /events
        Given json
            """
            {
                "id": "ABC001",
                "specversion": "1.0",
                "source": "/test/only",
                "type": "Test.Only",
                "time": "2022-11-25T14:06:53Z",
                "data": {
                    "a": 2
                }
            }
            """
        When method POST
        Then expect status should be 200
        Then expect body should be json
            """
            {
                "status": "SUCCESS"
            }
            """

    Scenario: /events, 299 body is empty

        Given url /events
        When method POST
        Then expect status should be 299
        Then expect body should be json
            """
            {
                "status": "DROP"
            }
            """

    Scenario Outline: /events, 299 if body is malformed

        Given url /events
        Given json
            """
            {
                "id": "<id>",
                "specversion": "<specversion>",
                "source": "<source>",
                "type": "<type>",
                "time": "<time>",
                "data": {
                    "a": 2
                }
            }
            """
        When method POST
        Then expect status should be 299
        Then expect body should be json
            """
            {
                "status": "DROP"
            }
            """
        Examples:
            | id     | specversion | source     | type      | time                 |
            |        | 1.0         | /test/only | Test.Only | 2022-11-25T14:06:53Z |
            | ABC001 |             | /test/only | Test.Only | 2022-11-25T14:06:53Z |
            | ABC001 | 1.0         |            | Test.Only | 2022-11-25T14:06:53Z |
            | ABC001 | 1.0         | /test/only |           | 2022-11-25T14:06:53Z |
            | ABC001 | 1.0         | /test/only | Test.Only |                      |

    Scenario: /events, on('event')

        Given url /events
        Given json
            """
            {
                "id": "ABC001",
                "specversion": "1.0",
                "source": "/test/only",
                "type": "Test.Only",
                "time": "2022-11-25T14:06:53Z",
                "data": {
                    "a": 2
                }
            }
            """
        When method POST
        Then expect status should be 200
        Then expect events should be
            | type      | source     |
            | POST      | /events    |
            | Test.Only | /test/only |
            | 200       | /events    |
