Feature: GET

    Background:

        Given new environment

    Scenario: /version, 200

        Given url /version
        When method GET
        Then expect status should be 200
        Then expect body should be json
            """
            {
                "version": "0.0.0"
            }
            """
