Feature: GET /versions

    Background:

        Given new environment
            | service |

    Scenario: 200

        Given url /versions
        When method GET
        Then expect status should be 200
        Then expect body schema should be
            | openapi          |
            | paths            |
            | /versions        |
            | get              |
            | responses        |
            | 200              |
            | content          |
            | application/json |
            | schema           |
        Then expect body should be json
            """
            {
                "backend": "0.0.0",
                "platform": "win32",
                "os": "Windows 10 Enterprise"
            }
            """
