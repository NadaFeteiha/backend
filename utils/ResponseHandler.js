export class ResponseHandler {

    static success(res, data, message = "Success", statusCode = 200) {
        return res.status(statusCode).json({
            status: true,
            message,
            data,
        });
    }

    static error(res, message = "An error occurred", statusCode = 400) {
        return res.status(200/*statusCode*/).json({
            status: false,
            message,
        });
    }
}

