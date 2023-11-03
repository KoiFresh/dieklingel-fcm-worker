type FcmMessage = {
  message: {
    token: string;
    android: {
      notification: {
        title: string;
        body: string;
        sound: string;
        icon: string;
      };
    };
    apns: {
      payload: {
        aps: {
          alert: {
            title: string;
            subtitle: string;
            body: string;
          };
          sound: string;
          "mutable-content": number;
        };
      };
    };
    fcm_options: {
      image: string;
    };
  };
};
