Feature: GET

    Background:

        Given new environment

    Rule: /health

        Scenario: 200

            Given url /health
            When method GET
            Then expect status should be 200

        Scenario: 207, ?type=

            Given url /health?type=db,unknown
            When method GET
            Then expect status should be 207
            Then expect headers should contain
                | name         | value            |
                | content-type | application/json |
            Then expect body should be json
                """
                [
                    {
                        "type": "db",
                        "detail": {
                            "sqlite": "connectable"
                        }
                    },
                    {
                        "type": "unknown",
                        "reason": {
                            "title": "NotFound",
                            "status": 404,
                            "detail": "there is no health check for unknown"
                        }
                    }
                ]
                """
