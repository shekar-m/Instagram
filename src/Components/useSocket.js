import { useEffect, useState, useMemo } from "react";
import io from "socket.io-client";

const useSocket = (url, options) => {
  const [socket, setSocket] = useState(null);

  const memoizedOptions = useMemo(
    () => options,
    [
      options.transports,
      options.reconnection,
      options.reconnectionAttempts,
      options.reconnectionDelay,
    ]
  );

  useEffect(() => {
    const socketInstance = io(url, memoizedOptions);
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url, memoizedOptions]);

  return socket;
};

export default useSocket;
