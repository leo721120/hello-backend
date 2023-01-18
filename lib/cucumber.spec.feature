Feature: HTTP example

    Background:

        Given new environment
        Given setup /echo

    Scenario: POST /echo, 200

        Given url /echo
        Given headers
            | name        | value   |
            | x-any-value | test123 |
        Given json
            """
            {
                "abc": 123
            }
            """
        When method POST
        Then expect status should be 200
        Then expect headers should contain
            | name        | value   |
            | x-any-value | test123 |
        Then expect body should be json
            """
            {
                "abc": 123
            }
            """
