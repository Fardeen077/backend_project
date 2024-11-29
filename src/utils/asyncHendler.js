const asyncHandler = (requestHendler) => {
    (req, res, next) => {
        Promise.resolve(requestHendler(req, res, next)).catch((err) => next(err));
    }
}

export { asyncHandler }

// hight hoder function
// const asyncHandler = ()=> {}
// const asyncHandler = (func) => {}
// const asynchandler = (fn) => async() => {}

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 5000).json({
//             success: false,
//             message: error.message,
//         });
//     }
// }

