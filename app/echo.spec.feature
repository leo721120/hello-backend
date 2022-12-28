Feature: GET

    Background:

        Given new environment

    Scenario: /echo, 200

        Given url /echo
        When method GET
        Then expect status should be 200
        Then expect body should be json
            """
            {
                "method": "GET",
                "path": "/echo",
                "query": {},
                "header": {}
            }
            """
