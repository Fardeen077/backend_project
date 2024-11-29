class ApiResponse {
    constructor(stausCode, data, message = "Success") {
        this.stausCode = stausCode
        this.data = data
        this.message = message
        // stauscode 400 is base on thro type of error this is 4 type 
        //         Informational responses (100 – 199)
        // Successful responses (200 – 299)
        // Redirection messages (300 – 399)
        // Client error responses (400 – 499)
        // Server error responses (500 – 599)
        this.success = stausCode < 400
    }

}