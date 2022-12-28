Feature: HTTP example

    Background:

        Given new environment

    Scenario: GET /foo, 400

        Given url /foo
        When method GET
        Then expect status should be 400

    Scenario: POST /foo, 400

        Given url /foo
        Given json
            """
            {
                "example": "data"
            }
            """
        When method POST
        Then expect status should be 400
