import { Button } from "@mui/material";

interface PayButtonProps {
    paymentType: string;
    isApplePayReady: boolean;
    isGooglePayReady: boolean;
    isSamsungPayReady: boolean;
    isPayError: boolean;
}

const PayButton: React.FC<PayButtonProps> = (props) => {
    const { paymentType, isApplePayReady, isGooglePayReady, isSamsungPayReady, isPayError } = props;

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
                    {!isApplePayReady ? (
                        <button type="submit" className="fake-pay-button apple-pay-button"></button>
                    ) : (
                        isPayError && <div id="apple-pay-button-container"></div>
                    )}
                </>

            )}
            {paymentType === "google-pay" && (
                <>
                    {!isGooglePayReady && isPayError ? (
                        <button
                            type="submit"
                            className="fake-pay-button google-pay-button"
                        ></button>
                    ) : (
                        isPayError && <div id="google-pay-button-container"></div>
                    )}
                </>
            )}
            {paymentType === "samsung-pay" && (
                <>
                    {!isSamsungPayReady && isPayError ? (
                        <button
                            type="submit"
                            className="fake-pay-button samsung-pay-button"
                        ></button>
                    ) : (
                        isPayError && <div id="samsung-pay-button-container"></div>
                    )}
                </>
            )}
        </>
    )
}

export default PayButton