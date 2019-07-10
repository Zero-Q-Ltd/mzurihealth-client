export interface PaymentMethod {
    accountNumber: string;
    extraInfo: string;
    paymentChannelId: string;
    paymentMethodId: string;
}

export const emptypaymentmethod: PaymentMethod = {
    paymentMethodId: '',
    paymentChannelId: '',
    accountNumber: '',
    extraInfo: ''
};
