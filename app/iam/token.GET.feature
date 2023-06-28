Feature: GET /token

    Background:

        Given new environment
            | service |

    Scenario: 200

        Given url /token
        Given headers
            | name          | value      |
            | Authorization | basic YTpi |
        When method GET
        Then expect status should be 200
        Then expect headers should contain
            | name         | value            |
            | content-type | application/json |
        Then expect body schema should be
            | openapi          |
            | paths            |
            | /token           |
            | get              |
            | responses        |
            | 200              |
            | content          |
            | application/json |
            | schema           |
        Then expect body should match json
            """
            {
                "token_type": "jwt",
                "expires_in": 300
            }
            """

    Scenario Outline: 200, ?expire=<expire>

        Given url /token?expire=<expire>
        Given headers
            | name          | value      |
            | Authorization | basic YTpi |
        When method GET
        Then expect status should be 200
        Then expect headers should contain
            | name         | value            |
            | content-type | application/json |
        Then expect body schema should be
            | openapi          |
            | paths            |
            | /token           |
            | get              |
            | responses        |
            | 200              |
            | content          |
            | application/json |
            | schema           |
        Then expect body should match json
            """
            {
                "token_type": "jwt",
                "expires_in": <expire>
            }
            """
        Examples:
            | expire |
            | 1      |
            | 3600   |
            | 50     |

    Scenario Outline: 400, Authorization=<auth>

        Given url /token
        Given headers
            | name          | value  |
            | Authorization | <auth> |
        When method GET
        Then expect status should be 400
        Then expect headers should contain
            | name         | value                    |
            | content-type | application/problem+json |
        Then expect body schema should be
            | openapi                  |
            | paths                    |
            | /token                   |
            | get                      |
            | responses                |
            | 400                      |
            | content                  |
            | application/problem+json |
            | schema                   |
        Then expect body should be json
            """
            {
                "detail": "<reason>",
                "instance": "/token",
                "status": 400,
                "title": "SyntaxError"
            }
            """
        Examples:
            | auth | reason                                           |
            | p    | must NOT have fewer than 3 characters            |
            | p q  | must match pattern \"^(basic) [a-zA-Z0-9+/=]+$\" |

    Scenario Outline: 400, ?expire=<expire>

        Given url /token?expire=<expire>
        Given headers
            | name          | value      |
            | Authorization | basic YTpi |
        When method GET
        Then expect status should be 400
        Then expect headers should contain
            | name         | value                    |
            | content-type | application/problem+json |
        Then expect body schema should be
            | openapi                  |
            | paths                    |
            | /token                   |
            | get                      |
            | responses                |
            | 400                      |
            | content                  |
            | application/problem+json |
            | schema                   |
        Then expect body should be json
            """
            {
                "detail": "<reason>",
                "instance": "/token?expire=",
                "status": 400,
                "title": "SyntaxError"
            }
            """
        Examples:
            | expire | reason          |
            | 9999   | must be <= 3600 |
            | 0      | must be >= 1    |
            | -100   | must be >= 1    |
            | abc    | must be <= 3600 |
            | a100   | must be <= 3600 |
