import express from '@io/lib/express'
import mock from 'supertest'
export default Object.assign(express, {
    /**
    wrap application for test
    */
    fetch(app: ReturnType<typeof express>) {
        return mock(app);
    },
});