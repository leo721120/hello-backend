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

    Scenario: /any/api, trace context

        Given url /any/api
        Given headers
            | name        | value                                                   |
            | traceparent | 00-28ac0d17901b92f1fd1c956f7f6f06a2-0aa34a3476a5bc01-01 |
        When method GET
        Then expect status should be 400
        Then expect headers should contain
            | name        | value                                                   |
            | traceparent | 00-28ac0d17901b92f1fd1c956f7f6f06a2-0aa34a3476a5bc01-01 |

    Scenario: /not/exist, 400

        Given url /not/exist
        When method GET
        Then expect status should be 400
        Then expect headers should contain
            | name         | value                    |
            | content-type | application/problem+json |

    Scenario: /not/exist, on('event')

        Given url /not/exist
        When method GET
        Then expect status should be 400
        Then expect events should be
            | type | source     |
            | GET  | /not/exist |
            | 400  | /not/exist |
