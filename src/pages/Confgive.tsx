import { useEffect, useState } from "react";
import { Button, Select, MenuItem, ListItemIcon } from "@mui/material";
import { TextField, InputAdornment, Box } from "@mui/material";
import { Checkbox, FormControlLabel } from "@mui/material";
import { SiApplepay } from "react-icons/si";
import { FaGooglePay } from "react-icons/fa6";
import { SiSamsungpay } from "react-icons/si";
import { CiCreditCard1 } from "react-icons/ci";
import CreditCard from "./CreditCard";
import ExchangeRate from "./ExchangeRate";
import { useForm, SubmitHandler } from "react-hook-form";
import "./Congive.scss";

declare global {
    let TPDirect: any;
}

const CONFGive = () => {
    const [scrollOpacity, setScrollOpacity] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [titleHeight, setTitleHeight] = useState(536);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);

            // **增加 maxScroll，讓透明度變化更慢**
            const maxScroll = 400; // **變黑的範圍變大，變化更緩慢**
            const opacity = Math.min(currentScrollY / maxScroll, 1);
            setScrollOpacity(opacity);

            // 計算新的高度，最小高度為 124px，最大高度為 536px
            const newHeight = Math.max(124, 536 - currentScrollY); // 滾動時高度變化
            setTitleHeight(newHeight);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const { register, handleSubmit, getValues, watch, formState: { errors } } = useForm<{ amount: number; email: string; phone_number: string; receipt: boolean; paymentType: string; name: string; upload: boolean }>(
        {
            mode: "onChange", // 這裡設定為 onChange
            defaultValues: {
                amount: 0,
                email: '',
                phone_number: '',
                receipt: false,
                paymentType: 'credit-card',
            },
        }
    );
    const amount = getValues("amount");
    const amountWatch = watch("amount")
    const email = getValues("email");
    const upload = getValues("upload");
    const phone_number = getValues("phone_number");
    const paymentType = getValues("paymentType");
    const name = getValues("name");

    const [getPaymentType, setPaymentType] = useState("personal");

    useEffect(() => {
        console.log(register("amount"));
        console.log("Amount 錯誤：", errors.amount);
        console.log("Amount 值：", amount);

    }, [amount, amountWatch, errors.amount, register]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        document.getElementById('pr-button')?.style.setProperty(
            'display',
            paymentType === "apple-pay" ? 'block' : 'none'
        );
    }, [paymentType]);


    // 提交表單
    // const handleSubmit = (e: React.FormEvent) => {
    //     e.preventDefault(); // 防止表單的默認提交行為

    //     TPDirect.card.getPrime((result: any) => {
    //         if (result.status !== 0) {
    //             alert('取得 Prime 失敗：' + result.msg);
    //             return;
    //         };
    //         alert('Prime 取得成功：' + result.card.prime);
    //         // 傳送至後端 API
    //         postPay(result.card.prime);
    //     });
    // };

    // Apple Pay 按鈕點擊事件
    const applePayHandleSubmit = () => {
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
                amount: Number(amount),
                cardholder: {
                    name: name,
                    email: email,
                    phone_number: phone_number,
                },
            }),
        })
            .then((res) => res.json())
            .then(() => alert('交易成功！'))
            .catch((err) => alert('交易失敗：' + err.message));
    }

    // onSubmit 會在表單提交時被調用
    const onSubmit: SubmitHandler<{ amount: number; email: string; phone_number: string; }> = (data) => {
        console.log(data);
    };

    return (
        <div>
            <div
                className="title"
                style={{
                    "--scroll-opacity": scrollOpacity,
                    height: `${titleHeight}px`, // 動態改變高度
                } as React.CSSProperties}
            >
                <div className="title-block"
                    style={{ color: titleHeight < 536 ? "#F1D984" : "#FFF", bottom: titleHeight < 536 ? "10px" : "20px" }}>
                    <p className="title-name">{titleHeight < 536 ? "’25" : "2025"} <br style={{ display: titleHeight < 536 ? "none" : "block" }}></br>{titleHeight < 536 ? "THE HOPE Conference" : "THE HOPE 特會"}</p>
                    <p className="title-property">GIVE</p>
                </div>
            </div>
            <div className="wrapper"
                style={{ marginTop: titleHeight > 124 ? `${titleHeight + scrollY}px` : "530px" }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box className="form">
                        <Box className="form-block">
                            <TextField
                                {...register("amount", {
                                    valueAsNumber: true,
                                    required: "金額必填",
                                    validate: (value) => value > 0 || "金額必須大於 0",
                                })}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">NT$</InputAdornment>,
                                    },
                                }}
                                className="amount basic-formControl"
                                type="number"
                                error={!!errors.amount}
                                helperText={errors.amount?.message}
                            />
                            <ExchangeRate value={watch('amount')}></ExchangeRate>
                            <TextField
                                {...register("email", {
                                    required: "Email必填",
                                    validate: (value) => {
                                        const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                                        return emailPattern.test(value) || "Email 格式不正確";
                                    }
                                })}
                                placeholder="Email"
                                className="email basic-formControl"
                                name="email"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                            {errors.email && <p className="error-text">{errors.email.message}</p>}
                            <Box className="phone-block">
                                <TextField
                                    id="outlined-read-only-input"
                                    defaultValue="+886"
                                    slotProps={{
                                        input: {
                                            readOnly: true,
                                        },
                                    }}
                                    className="phone-code basic-formControl"
                                />
                                <TextField
                                    {...register("phone_number", { required: "電話必填" })}
                                    id="outlined-required"
                                    placeholder="Mobile Number"
                                    className="phone-number basic-formControl"
                                    name="phone_number"
                                    type="number"
                                    error={!!errors.phone_number}
                                    helperText={errors.phone_number?.message}
                                />
                            </Box>
                            <Box className="contact-information">
                                <p className="contact-information-note">如要與教會十一奉獻數據整併，請填寫相同的聯絡資料</p>
                                <div className="receipt-name-block">
                                    <FormControlLabel
                                        className="checkbox-label-block"
                                        {...register("receipt")}
                                        control={
                                            <Checkbox className="checkbox-custom" />
                                        }
                                        label={<div className="label-custom">
                                            <p className="label-chinese">是否需開立年度奉獻收據？</p>
                                            <p className="label-english">Do you need annual giving receipt？</p></div>}
                                        labelPlacement="start"
                                    />
                                    {watch("receipt") && (
                                        <>
                                            <div>
                                                <Button onClick={() => setPaymentType("personal")}
                                                    className={`personal-company-button ${getPaymentType === "personal" ? "clicked" : "not-clicked"}`}
                                                >個人</Button>
                                                <Button onClick={() => setPaymentType("company")} className={`personal-company-button ${getPaymentType === "company" ? "clicked" : "not-clicked"}`}>企業</Button>
                                            </div>
                                            <div>
                                                <p className="label-chinese">收據姓名</p>
                                                <p className="label-english">Receipt Name</p>
                                                <TextField
                                                    id="outlined-required"
                                                    className="receiptName width100 basic-formControl"
                                                    name="receiptName"
                                                />
                                                <p className="contact-information-note">如有報稅需求，請填寫與台灣身分證相符的姓名</p>
                                            </div>
                                        </>
                                    )
                                    }
                                </div>
                                {watch("receipt") && (
                                    <div className="company-tax-block">
                                        <div>
                                            <p className="label-chinese">企業登記全名</p>
                                            <p className="label-english">Company's Registered Name</p>
                                            <TextField
                                                id="outlined-required"
                                                className="receiptName width100 basic-formControl"
                                                name="companyName"
                                            />
                                        </div>
                                        <div>
                                            <p className="label-chinese">統一編號</p>
                                            <p className="label-english">Tax ID Number</p>
                                            <TextField
                                                id="outlined-required"
                                                className="nationalID width100 basic-formControl"
                                                name="taxID"
                                            />
                                        </div>
                                    </div>
                                )}
                                <FormControlLabel
                                    className="checkbox-label-block"
                                    {...register("upload")}
                                    control={
                                        <Checkbox className="checkbox-custom" />
                                    }
                                    label={<div className="label-custom">
                                        <p className="label-chinese">是否上傳國稅局？(台灣報稅需要)</p>
                                        <p className="label-english">Do you need to submit your taxes to Taiwan's IRS?</p></div>}
                                    labelPlacement="start"
                                />
                                {watch("upload") && (
                                    <div>
                                        <p className="label-chinese">身分證字號</p>
                                        <p className="label-english">National ID</p>
                                        <TextField
                                            id="outlined-required"
                                            className="nationalID width100 basic-formControl"
                                            name="nationalID"
                                        />
                                    </div>
                                )}
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
                                                icon = <SiApplepay size={24} />;
                                                text = "Apple Pay";
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
                                <CreditCard paymentType={watch("paymentType")} register={register} errors={errors}></CreditCard>

                                {paymentType !== "apple-pay" && (
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        className="continue-button width100"
                                    >
                                        CONTINUE
                                    </Button>
                                )}

                                <div id="pr-button" style={{ display: "none" }}></div>
                            </Box>
                        </Box>
                    </Box>
                </form>

                <div className="success">
                    <img src="/images/success.png" alt="" />
                    <div>
                        <p className="success-title">奉獻完成</p>
                        <p className="success-title-english">Give Success</p>
                    </div>
                    <div>
                        <p className="note-chinese">我們會將奉獻結果寄給您。請留意您的信箱</p>
                        <p className="note-english">We will email you the result of giving. <br></br>Please check your email.</p>
                    </div>
                    <Button
                        variant="contained"
                        className="continue-button width100">
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CONFGive;