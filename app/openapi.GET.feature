Feature: GET

    Background:

        Given new environment

    Scenario: /openapi, 200

        Given url /openapi
        When method GET
        Then expect status should be 200
        Then expect headers should contain
            | name         | value            |
            | content-type | application/json |

    Scenario: /not/exist, 400

        Given url /not/exist
        When method GET
        Then expect status should be 400
        Then expect headers should contain
            | name         | value            |
            | content-type | application/json |

    Scenario: /not/exist, on('event')

        Given url /not/exist
        When method GET
        Then expect status should be 400
        Then expect events should be
            | type | source     |
            | GET  | /not/exist |
            | 400  | /not/exist |
