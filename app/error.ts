export default {
}
declare global {
    interface BrandAlreadyExisted extends Error {
        readonly name: 'License.BrandAlreadyExisted'
        readonly errno: 400 | 409
    }
    interface BrandNotFound extends Error {
        readonly name: 'License.BrandNotFound'
        readonly errno: 400 | 404
    }
    interface ExternalServerNotAllowAccess extends Error {
        readonly name: 'License.ExternalServerNotAllowAccess'
        readonly errno: 500 | 502
        readonly help: string
    }
}