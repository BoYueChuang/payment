import { useEffect, useState } from "react";
import { Button, Select, MenuItem, ListItemIcon } from "@mui/material";
import { TextField, InputAdornment, Box } from "@mui/material";
import { Checkbox, FormControlLabel } from "@mui/material";
import { SiApplepay } from "react-icons/si";
import { FaGooglePay } from "react-icons/fa6";
import { SiSamsungpay } from "react-icons/si";
import { CiCreditCard1 } from "react-icons/ci";
import "./Congive.scss";
import CreditCard from "./CreditCard";
import ExchangeRate from "./ExchangeRate";

declare global {
    var TPDirect: any;
}

const CONFGive = () => {
    const [value, setValue] = useState("credit-card");
    const [formData, setFormData] = useState({
        amount: 0, // 奉獻金額
        email: "", // 電子郵件
        phone_number: "", // 手機號碼
    });

    useEffect(() => {
        console.log("TapPay SDK 加載完成");

        TPDirect.setupSDK(
            Number(import.meta.env.VITE_TAPPAY_APP_ID),
            import.meta.env.VITE_TAPPAY_APP_KEY || '',
            'sandbox'
        );

        TPDirect.paymentRequestApi.checkAvailability();

        TPDirect.paymentRequestApi.setupApplePay({
            merchantIdentifier: 'APMEKWC6Lx70yYyTyxpg',
            countryCode: 'TW',
        });

        TPDirect.paymentRequestApi.setupPayWithGoogle({
            allowedPaymentMethods: ['CARD', 'TOKENIZED_CARD'],
            allowPrepaidCards: true,
            billingAddressRequired: false,
            billingAddressFormat: 'MIN',
        });

        applePayHandleSubmit();
    }, []);

    useEffect(() => {
        document.getElementById('pr-button')?.style.setProperty(
            'display',
            value === "apple-pay" ? 'block' : 'none'
        );
    }, [value]);


    // 處理輸入變更
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // 提交表單
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // 防止表單的默認提交行為
        console.log("提交的資料:", formData);

        TPDirect.card.getPrime((result: any) => {
            if (result.status !== 0) {
                alert('取得 Prime 失敗：' + result.msg);
                return;
            };
            alert('Prime 取得成功：' + result.card.prime);
            // 傳送至後端 API
            postPay(result.card.prime);
        });
    };

    // Apple Pay 按鈕點擊事件
    const applePayHandleSubmit = () => {
        console.log('sss');

        // 建立 paymentRequest 物件
        const paymentRequest = {
            supportedNetworks: ['AMEX', 'JCB', 'MASTERCARD', 'VISA'],
            supportedMethods: ['apple_pay'],

            displayItems: [{
                label: 'TapPay - iPhone8',
                amount: {
                    currency: 'TWD',
                    value: '1.00'
                }
            }],
            total: {
                label: '付給 TapPay',
                amount: {
                    currency: 'TWD',
                    value: '1.00'
                }
            },
            shippingOptions: [{
                id: "standard",
                label: "🚛 Ground Shipping (2 days)",
                detail: 'Estimated delivery time: 2 days',
                amount: {
                    currency: "TWD",
                    value: "5.00"
                }
            },
            {
                id: "drone",
                label: "🚀 Drone Express (2 hours)",
                detail: 'Estimated delivery time: 2 hours',
                amount: {
                    currency: "TWD",
                    value: "25.00"
                }
            },
            ],
            options: {
                requestPayerEmail: false,
                requestPayerName: false,
                requestPayerPhone: false,
                requestShipping: false,
                shippingType: 'shipping'
            }
        };

        TPDirect.paymentRequestApi.setupPaymentRequest(paymentRequest, function (result: any) {
            if (!result.browserSupportPaymentRequest) {
                console.log('❌ 瀏覽器不支援 PaymentRequest');
                return;
            };

            if (result.canMakePaymentWithActiveCard) {
                console.log('✅ 該裝置有支援的卡片可以付款');
                console.log(TPDirect.paymentRequestApi)
                TPDirect.paymentRequestApi.setupTappayPaymentButton('#pr-button', (getPrimeResult: any) => {
                    console.log('Prime 取得成功：', getPrimeResult);
                    postPay(getPrimeResult.prime);
                });
            } else if (result.canMakePaymentWithActiveCard === false) {
                console.log('⚠️ 該裝置沒有支援的卡片可以付款');
            } else {
                console.warn('⚠️ 無法確定裝置是否支援 Apple Pay，請檢查回傳值', result);
            };
        });
    }

    // api
    const postPay = (prime: string) => {
        fetch('https://repo-tappy.vercel.app/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prime: prime,
                amount: Number(formData.amount),
                cardholder: {
                    name: 'John Doe',
                    email: formData.email,
                    phone_number: formData.phone_number,
                },
            }),
        })
            .then((res) => res.json())
            .then(() => alert('交易成功！'))
            .catch((err) => alert('交易失敗：' + err.message));
    }


    return (
        <div className="wrapper">
            <div className="title">
                <div className="title-block">
                    <p className="title-name">2025 <br></br>THE HOPE 特會</p>
                    <p className="title-property">GIVE</p>
                </div>
            </div>
            <Box className="form">
                <TextField
                    required
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start">NT$</InputAdornment>,
                        },
                    }}
                    className="amount basic-formControl"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                />
                <ExchangeRate value={formData.amount}></ExchangeRate>
                <TextField
                    required
                    placeholder="Email"
                    className="email basic-formControl"
                    sx={{ marginBottom: "15px", width: "300px" }}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", width: "100%", maxWidth: "300px" }}>
                    <TextField
                        id="outlined-read-only-input"
                        defaultValue="+886"
                        slotProps={{
                            input: {
                                readOnly: true,
                            },
                        }}
                        sx={{ width: "100px" }}
                    />
                    <TextField
                        required
                        id="outlined-required"
                        placeholder="Mobile Number"
                        sx={{ width: "190px" }}
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                    />
                </Box>
                <Select
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    displayEmpty
                    sx={{ width: "300px", marginBottom: "15px" }}
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
                                icon = <SiApplepay size={24} />;
                                text = "Apple Pay";
                                break;
                        }

                        return (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {icon}
                                {text}
                            </Box>
                        );
                    }}
                >
                    <MenuItem value="apple-pay">
                        <ListItemIcon>
                            <SiApplepay size={24} />
                        </ListItemIcon>
                        Apple Pay
                    </MenuItem>
                    <MenuItem value="google-pay">
                        <ListItemIcon>
                            <FaGooglePay size={24} />
                        </ListItemIcon>
                        Google Pay
                    </MenuItem>
                    <MenuItem value="samsung-pay">
                        <ListItemIcon>
                            <SiSamsungpay size={24} />
                        </ListItemIcon>
                        Samsung Pay
                    </MenuItem>
                    <MenuItem value="credit-card">
                        <ListItemIcon>
                            <CiCreditCard1 size={24} />
                        </ListItemIcon>
                        Credit Card
                    </MenuItem>
                </Select>
                <CreditCard value={value}></CreditCard>

                <FormControlLabel
                    sx={{ marginBottom: "15px", width: "300px", marginLeft: "0", marginRight: "0", display: "flex", justifyContent: "space-between" }}
                    control={<Checkbox sx={{ padding: "0" }} />}
                    label={<div className="font-size-15"><p>是否需開立年度奉獻收？</p><p>Do you need annual giving receipt？</p></div>}
                    labelPlacement="start"
                />

                <FormControlLabel
                    sx={{ marginBottom: "15px", width: "300px", marginLeft: "0", marginRight: "0", display: "flex", justifyContent: "space-between" }}
                    control={<Checkbox sx={{ padding: "0" }} />}
                    label={<div className="font-size-15"><p>是否上傳國稅局？(台灣報稅需要)</p><p>Do you need to submit your taxes to Taiwan's IRS？</p></div>}
                    labelPlacement="start"
                />
                {value !== "apple-pay" && (
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            width: "300px",
                            borderRadius: "20px",
                            backgroundColor: '#ff9300',
                            marginTop: "10px"
                        }}
                        onClick={handleSubmit}
                    >
                        CONTINUE
                    </Button>
                )}

                <div id="pr-button" style={{ display: "none" }}></div>

            </Box>
        </div>
    );
};

export default CONFGive;