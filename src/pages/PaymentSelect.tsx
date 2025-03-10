import { Select, MenuItem, ListItemIcon, Box } from "@mui/material";
import { UseFormRegister } from "react-hook-form";
import { SiApplepay } from "react-icons/si";
import { FaGooglePay } from "react-icons/fa6";
import { SiSamsungpay } from "react-icons/si";
import { CiCreditCard1 } from "react-icons/ci";
import { useEffect, useState } from "react";

interface PaymentSelectProps {
    register: UseFormRegister<any>;
}


const PaymentSelect: React.FC<PaymentSelectProps> = (props) => {
    const { register } = props;

    const [paymentOptions, setPaymentOptions] = useState([
        { label: "Apple Pay", value: "apple-pay", icon: <SiApplepay size={24} /> },
        { label: "Google Pay", value: "google-pay", icon: <FaGooglePay size={24} /> },
        { label: "Samsung Pay", value: "samsung-pay", icon: <SiSamsungpay size={24} /> },
    ]);

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
        const isAndroid = /Android/.test(userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent); // 判斷 Safari
        const isChrome = /Chrome/.test(userAgent) && !/Edge|OPR|SamsungBrowser/.test(userAgent); // 排除 Edge、Opera、Samsung
        const isSamsungBrowser = /SamsungBrowser/.test(userAgent);

        setPaymentOptions((options) =>
            options.filter((option) => {
                if (option.value === "apple-pay") {
                    return isIOS && isSafari; // 只有 iOS + Safari 才顯示
                }
                if (option.value === "google-pay") {
                    return isChrome || isAndroid; // 只有 Chrome 或 Android 才顯示
                }
                if (option.value === "samsung-pay") {
                    return isSamsungBrowser; // 只有 Samsung Browser 才顯示
                }
                return true; // 預設保留其他選項
            })
        );
    }, []);

    return (
        <Select
            displayEmpty
            {...register("paymentType")}
            defaultValue={"credit-card"}
            className="payment-method width100 basic-formControl"
            renderValue={(selected) => {
                let icon, text;

                // 動態選擇對應的圖標和文字
                switch (selected) {
                    case "apple-pay":
                        icon = <SiApplepay size={24} />;
                        text = "Apple Pay";
                        break;
                    case "google-pay":
                        icon = <FaGooglePay size={24} />;
                        text = "Google Pay";
                        break;
                    case "samsung-pay":
                        icon = <SiSamsungpay size={24} />;
                        text = "Samsung Pay";
                        break;
                    case "credit-card":
                        icon = <CiCreditCard1 size={24} />;
                        text = "Credit Card";
                        break;
                    default:
                        icon = <CiCreditCard1 size={24} />;
                        text = "Credit Card";
                        break;
                }

                return (
                    <Box className="payment-method-icon-text">
                        {icon}
                        {text}
                    </Box>
                );
            }}
        >
            {paymentOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    <ListItemIcon>
                        {option.icon}
                    </ListItemIcon>
                    {option.label}
                </MenuItem>
            ))}
            <MenuItem value="credit-card">
                <ListItemIcon>
                    <CiCreditCard1 size={24} />
                </ListItemIcon>
                Credit Card
            </MenuItem>
        </Select>
    )
}

export default PaymentSelect