import { Button } from "@mui/material";

interface PayButtonProps {
    paymentType: string;
    isApplePayReady: boolean;
    isGooglePayReady: boolean;
    isSamsungPayReady: boolean;
    setupGooglePay: () => void;
    setupApplePay: () => void;
    setupSamsungPay: () => void;
}

const PayButton: React.FC<PayButtonProps> = (props) => {
    const { paymentType, isApplePayReady, isGooglePayReady, isSamsungPayReady, setupGooglePay, setupApplePay, setupSamsungPay } = props;

    return (
        <>
            {paymentType === "credit-card" && (
                <Button
                    type="submit"
                    variant="contained"
                    className="continue-button width100">
                    CONTINUE
                </Button>
            )}
            {paymentType === "apple-pay" && (
                <>
                    {isApplePayReady ? (
                        <div id="apple-pay-button-container" onClick={setupApplePay}></div>
                    ) : (
                        <button type="submit" className="fake-pay-button apple-pay-button"></button>
                    )}
                </>

            )}
            {paymentType === "google-pay" && (
                <>
                    {isGooglePayReady ? (
                        <div id="google-pay-button-container" onClick={setupGooglePay}></div>
                    ) : (
                        <button
                            type="submit"
                            className="fake-pay-button google-pay-button"
                        ></button>
                    )}
                </>
            )}
            {paymentType === "samsung-pay" && (
                <>
                    {isSamsungPayReady ? (
                        <div id="samsung-pay-button-container" onClick={setupSamsungPay}></div>
                    ) : (
                        <button
                            type="submit"
                            className="fake-pay-button samsung-pay-button"
                        ></button>
                    )}
                </>
            )}
        </>
    )
}

export default PayButton