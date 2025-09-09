namespace UserBackend.Response
{
    public class ResponseData<T>
    {
        public ResponseStatus Status { get; set; }
        public string Message { get; set; }
        public T? Data { get; set; }

        public ResponseData()
        {
            Status = ResponseStatus.OK;
            Message = string.Empty;
        }

        public ResponseData(T data, ResponseStatus status = ResponseStatus.OK, string message = "")
        {
            Data = data;
            Status = status;
            Message = message;
        }

        public ResponseData(ResponseStatus status, string message)
        {
            Status = status;
            Message = message;
        }
    }
}
