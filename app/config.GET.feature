Feature: GET

    Background:

        Given new environment
        Given configs
            | name   | data    |
            | cnf-01 | [1,2,7] |

    Rule: /configs/:name

        Scenario: 200

            Given url /configs/cnf-01
            Given authorization
                | username | password |
                | tester   | 1234     |
            When method GET
            Then expect status should be 200
            Then expect headers should contain
                | name         | value            |
                | content-type | application/json |
            Then expect body should be json
                """
                [
                    1,
                    2,
                    7
                ]
                """

        Scenario: 401

            Given url /configs/something
            When method GET
            Then expect status should be 401
            Then expect headers should contain
                | name         | value                    |
                | content-type | application/problem+json |

        Scenario: 404

            Given url /configs/not-exist
            Given authorization
                | username | password |
                | tester   | 1234     |
            When method GET
            Then expect status should be 404
            Then expect headers should contain
                | name         | value                    |
                | content-type | application/problem+json |
