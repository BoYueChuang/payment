import { useEffect, useState } from "react";
import { TextField, InputAdornment, Box } from "@mui/material";
import CreditCard from "./CreditCard";
import ExchangeRate from "./ExchangeRate";
import { useForm, SubmitHandler } from "react-hook-form";
import "./Congive.scss";
import Header from "./Header";
import GiveSucessOrFail from "./GiveSucessOrFail";
import ConfDialog from "./ConfDialog";
import PaymentSelect from "./PaymentSelect";
import Receipt from "./Receipt";
import Upload from "./Upload";
import PayButton from "./PayButton";
import CircularProgress from "@mui/material/CircularProgress";

declare global {
    let TPDirect: any;
}

interface confGiveProps {
    amount: number;
    email: string;
    phone_number: string;
    receipt: boolean;
    paymentType: string;
    name: string;
    upload: boolean;
    phoneCode: string;
    receiptName: string;
    nationalid: string;
    company: string;
    taxid: string;
    note: string;
}

const CONFGive = () => {
    const { register, handleSubmit, getValues, watch, formState: { errors, isValid } } = useForm<confGiveProps>(
        {
            mode: "onChange", // 這裡設定為 onChange
            defaultValues: {
                amount: 0,
                email: '',
                phone_number: '',
                receipt: false,
                paymentType: 'credit-card',
                note: '',
            },
        }
    );
    const [alertOpen, setAlertOpen] = useState(false);
    const [titleHeight, setTitleHeight] = useState(536);
    const [message, setMessage] = useState("");
    const [enMessage, setEnMessage] = useState("");
    const [giveStatus, setGiveStatus] = useState("form");
    const [isApplePayReady, setIsApplePayReady] = useState(false);
    const [isGooglePayReady, setIsGooglePayReady] = useState(false);
    const [isSamsungPayReady, setIsSamsungPayReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [receiptType, setReceiptType] = useState<string>("personal");
    const amount = getValues("amount");
    const paymentType = getValues("paymentType");
    const [isFocused, setIsFocused] = useState(false);
    const [creditCardStatus, setCreditCardStatus] = useState({
        number: '',
        expiry: '',
        ccv: ''
    });
    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    // **初始化設定 **
    useEffect(() => {
        console.log(import.meta.env.VITE_TAPPAY_APP_ID);
        console.log(import.meta.env.VITE_TAPPAY_APP_KEY);
        console.log(import.meta.env.VITE_APPLE_MERCHANT_ID);
        console.log(import.meta.env.VITE_GOOGLE_MERCHANT_ID);

        console.log("TapPay SDK 加載完成");
        TPDirect.setupSDK(
            Number(import.meta.env.VITE_TAPPAY_APP_ID),
            import.meta.env.VITE_TAPPAY_APP_KEY || '',
            'sandbox'
        );
        TPDirect.paymentRequestApi.checkAvailability();
        TPDirect.paymentRequestApi.setupApplePay({
            merchantIdentifier: import.meta.env.VITE_APPLE_MERCHANT_ID,
            countryCode: 'TW',
        });
        TPDirect.googlePay.setupGooglePay({
            googleMerchantId: import.meta.env.VITE_GOOGLE_MERCHANT_ID,
            allowedCardAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            merchantName: "The Hope",
            allowedCountryCodes: ['TW']
        });

        TPDirect.samsungPay.setup({
            country_code: 'tw'
        });
    }, []);

    useEffect(() => {
        TPDirectCardOnUpdate();
    }, []);


    // 設置 Credit Card 欄位狀態
    const TPDirectCardOnUpdate = () => {
        TPDirect.card.onUpdate((update: any) => {
            console.log("Credit Card 欄位狀態:", update.status);

            // 檢查欄位是否無效
            const isInvalid = (status: number) => status === 3 || status === 2;
            const isRequired = (status: number) => status === 1;

            setCreditCardStatus({
                number: isRequired(update.status.number) ? "Required" : isInvalid(update.status.number) ? "Invalid card number" : "",
                expiry: isRequired(update.status.expiry) ? "Required" : isInvalid(update.status.expiry) ? "Invalid expiration date" : "",
                ccv: isRequired(update.status.ccv) ? "Required" : isInvalid(update.status.ccv) ? "Invalid security code" : "",
            });
        });
    };



    useEffect(() => {
        console.log("表單錯誤狀態：", errors, isValid);
        if (isValid) {
            switch (paymentType) {
                case "apple-pay":
                    setupApplePay();
                    break;
                case "google-pay":
                    console.log('dd');

                    setupGooglePay();
                    break;
                case "samsung-pay":
                    setupSamSungPay();
                    break;
            };
        };
        // eslint-disable-next-line
    }, [errors, isValid, watch('paymentType')]);


    // **提交**
    const onSubmit: SubmitHandler<confGiveProps> = (data) => {
        if (data.paymentType === "credit-card") {
            setupCreditCard();
        };

        console.log("提交表單:", data);
    };


    // **設置 Apple Pay**
    const setupApplePay = async () => {
        setIsApplePayReady(true);

        const paymentRequest = {
            supportedNetworks: ["AMEX", "JCB", "MASTERCARD", "VISA"],
            supportedMethods: ["apple_pay"],
            displayItems: [{ label: "TapPay", amount: { currency: "TWD", value: amount.toString() } }],
            total: { label: "付給 TapPay", amount: { currency: "TWD", value: amount.toString() } },
        };

        const result: {
            browserSupportPaymentRequest: boolean,
            canMakePaymentWithActiveCard: boolean
        } = await new Promise((resolve) => {
            TPDirect.paymentRequestApi.setupPaymentRequest(paymentRequest, resolve);
        });

        console.log(result, "result of Apple Pay");


        if (!result.browserSupportPaymentRequest) {
            setIsApplePayReady(false);
            handleOpenAlert("此裝置不支援 Apple Pay", "This device does not support Apple Pay");
            return;
        };

        if (!result.canMakePaymentWithActiveCard) {
            setIsApplePayReady(false);
            handleOpenAlert("此裝置沒有支援的卡片可以付款", "This device does not have a supported card for payment");
            return;
        };

        console.log("✅ 該裝置有支援的卡片可以付款");

        const button = document.querySelector("#apple-pay-button-container");
        if (button) {
            setTimeout(() => {
                TPDirect.paymentRequestApi.setupTappayPaymentButton("#apple-pay-button-container", (getPrimeResult: any) => {
                    // console.log("Prime 取得成功：", getPrimeResult.card.lastfour);
                    postPay(getPrimeResult.prime, getPrimeResult.card.lastfour);
                });
            });
        } else {
            setIsApplePayReady(false);
            console.error("❌ Apple Pay 按鈕未正確插入 DOM");
        };
    };


    const setupGooglePay = () => {
        setIsGooglePayReady(true);

        let lastfour = '';

        const paymentRequest = {
            allowedNetworks: ["AMEX", "JCB", "MASTERCARD", "VISA"],
            price: amount.toString(),
            currency: "TWD",
        };

        TPDirect.googlePay.setupPaymentRequest(paymentRequest, function (err: any, result: any) {
            console.log('Error setting up payment request:', err);
            console.log('Result of setting up payment request:', result);
            lastfour = result?.card?.lastfour;
            console.log(result.canUseGooglePay);

            if (!result.canUseGooglePay) {
                handleOpenAlert("此裝置不支援 Google Pay", "This device does not support Google Pay");
                return;
            };
        });

        setTimeout(() => {
            TPDirect.googlePay.setupGooglePayButton({
                el: "#google-pay-button-container",
                color: "black",
                type: "long"
            });

            TPDirect.googlePay.getPrime(function (err: any, prime: any) {
                console.log(err);

                if (err) {
                    handleOpenAlert("此裝置不支援 Google Pay", "This device does not support Google Pay");
                    return;
                };
                postPay(prime, lastfour);
            });
        });
    }



    // **設置 Samsung Pay**
    const setupSamSungPay = () => {
        setIsSamsungPayReady(true);
        const paymentRequest = {
            supportedNetworks: ['MASTERCARD', 'VISA'],
            total: {
                label: 'The Hope',
                amount: {
                    currency: 'TWD',
                    value: amount.toString()
                }
            }
        };

        TPDirect.samsungPay.setupPaymentRequest(paymentRequest)

        console.log("✅ 該裝置有支援的卡片可以付款");

        setTimeout(() => {
            console.log("Samsung Pay 按鈕 DOM:", document.querySelector("#samsung-pay-button-container"));

            TPDirect.samsungPay.setupSamsungPayButton('#samsung-pay-button-container', {
                color: 'black',
                type: 'pay',
                shape: 'rectangular'
            });

            TPDirect.samsungPay.getPrime(function (result: any) {
                if (result.status !== 0) {
                    handleOpenAlert("此裝置不支援 Samsung Pay", "This device does not support Samsung Pay");
                    return;
                };

                console.log("✅ 取得成功:", result);
                postPay(result.prime, result.card.lastfour);
            });
        });
    }


    // **設置 信用卡**
    const setupCreditCard = () => {
        // 檢查各個欄位的狀態
        const tappayStatus = TPDirect.card.getTappayFieldsStatus();

        console.log("信用卡欄位狀態：", tappayStatus);

        // 檢查欄位是否無效
        const isInvalid = (status: number) => status === 3 || status === 2;
        const isRequired = (status: number) => status === 1;
        const valid = tappayStatus.status.number === 0 && tappayStatus.status.expiry === 0 && tappayStatus.status.ccv === 0;

        setCreditCardStatus({
            number: isRequired(tappayStatus.status.number) ? "Required" : isInvalid(tappayStatus.status.number) ? "Invalid card number" : "",
            expiry: isRequired(tappayStatus.status.expiry) ? "Required" : isInvalid(tappayStatus.status.expiry) ? "Invalid expiration date" : "",
            ccv: isRequired(tappayStatus.status.ccv) ? "Required" : isInvalid(tappayStatus.status.ccv) ? "Invalid security code" : "",
        });

        console.log("信用卡欄位狀態：", creditCardStatus);

        if (valid) {
            TPDirect.card.getPrime((result: any) => {
                if (result.status !== 0) {
                    document.body.style.backgroundColor = "#C4D9D4";
                    document.querySelector(".wrapper")?.classList.add("successAndFailWrapper");
                    setGiveStatus("fail");
                    return;
                };
                // 傳送至後端 API
                console.log(result);
                postPay(result.card.prime, result.card.lastfour);
            });
        };
    }

    // **傳送至後端 API**
    const postPay = (prime: string, last_four: string) => {
        setLoading(true);
        fetch('https://repo-tappy.vercel.app/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prime: prime,
                amount: Number(amount),
                cardholder: {
                    ...getValues(),
                    last_four
                }
            }),
        })
            .then((res) => res.json())
            .then(() => {
                console.log("✅ 付款成功");
                document.body.style.backgroundColor = "#F1D984";
                document.querySelector(".wrapper")?.classList.add("successAndFailWrapper");
                setGiveStatus("success");
                setLoading(false);
            })
            .catch((error) => {
                console.log("❌ 錯誤：", error);
                document.querySelector(".wrapper")?.classList.add("successAndFailWrapper");
                setGiveStatus("fail");
                setLoading(false);
            });
    }

    // **輸入框內禁止輸入 0 開頭**
    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 如果輸入的值是 0 開頭，去掉 0
        if (value.startsWith('0')) {
            e.target.value = value.slice(1);
        };
    };

    // **設置 Alert **
    const handleOpenAlert = (message: string, enMessage: string) => {
        setMessage(message);
        setEnMessage(enMessage);
        setAlertOpen(true);
    };

    // **關閉 Alert **
    const handleCloseAlert = () => {
        setAlertOpen(false);
    };

    return (
        <div>
            <Header titleHeight={titleHeight} setTitleHeight={setTitleHeight} giveStatus={giveStatus} ></Header>
            <div className="wrapper"
                style={{ marginTop: titleHeight > 124 ? `${titleHeight + scrollY}px` : "530px" }}>
                {(giveStatus === "success" || giveStatus === "fail") && (
                    <GiveSucessOrFail giveStatus={giveStatus}></GiveSucessOrFail>
                )}
                {giveStatus === "form" && (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box className="form">
                            <Box className="form-block">
                                <TextField
                                    {...register("amount", {
                                        valueAsNumber: true,
                                        required: "Required",
                                        validate: (value) => value > 0 || "金額必須大於 0",
                                    })}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment
                                                    position="start"
                                                    sx={{
                                                        color: isFocused ? "#FFA01F" : "rgba(40, 40, 41, 0.80)"
                                                    }}
                                                >
                                                    {isFocused}NT$
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                    className="amount basic-formControl"
                                    type="tel"
                                    error={!!errors.amount}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    helperText={errors.amount?.message}
                                />
                                {!isNaN(watch("amount")) && watch("amount") !== null &&
                                    <ExchangeRate value={watch("amount")} />
                                }
                                <TextField
                                    {...register("email", {
                                        required: "Required",
                                        validate: (value) => {
                                            const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
                                            return emailPattern.test(value) || "Email invalid";
                                        }
                                    })}
                                    placeholder="Email"
                                    className="email basic-formControl"
                                    name="email"
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                                <Box className="phone-block">
                                    <TextField
                                        id="outlined-read-only-input"
                                        {...register("phoneCode", {
                                            required: "Required"
                                        })}
                                        defaultValue="886"
                                        slotProps={{
                                            input: {
                                                readOnly: false,
                                                startAdornment: <InputAdornment position="start">+</InputAdornment>,
                                            },
                                        }}
                                        type="tel"
                                        error={!!errors.phoneCode}
                                        helperText={errors.phoneCode?.message}
                                        className="phone-code basic-formControl"
                                    />
                                    <TextField
                                        {...register("phone_number", {
                                            required: "Required",
                                            validate: (value) => value.length === 9 || "Mobile Number invalid"
                                        })}
                                        id="outlined-required"
                                        placeholder="Mobile Number"
                                        className="phone-number basic-formControl"
                                        type="tel"
                                        error={!!errors.phone_number}
                                        helperText={errors.phone_number?.message}
                                        // 輸入框內禁止輸入 0 開頭
                                        onInput={handlePhoneInputChange}
                                    />
                                </Box>
                                <Box className="contact-information">
                                    <p className="contact-information-note">如要與教會十一奉獻數據整併，請填寫相同的聯絡資料</p>
                                    <Receipt setReceiptType={setReceiptType}
                                        receiptType={receiptType}
                                        receipt={watch("receipt")}
                                        register={register}
                                        errors={errors}></Receipt>
                                    <Upload receiptType={receiptType}
                                        upload={watch("upload")}
                                        register={register}
                                        errors={errors}></Upload>
                                    <PaymentSelect register={register}></PaymentSelect>
                                    <CreditCard paymentType={watch("paymentType")}
                                        register={register}
                                        errors={errors}
                                        creditCardStatus={creditCardStatus}></CreditCard>
                                    <div className="width100">
                                        <p className="label-chinese">備註</p>
                                        <p className="label-english">Note</p>
                                        <TextField
                                            {...register("note", {
                                                maxLength: { value: 200, message: "Note must be less than 200 characters" }
                                            })}
                                            id="outlined-required"
                                            className="basic-formControl width100 m-t-8"
                                            type="text"
                                            multiline
                                            rows={4}
                                            error={!!errors.note}
                                            helperText={errors.note?.message}
                                        />
                                    </div>
                                    <PayButton paymentType={paymentType}
                                        isApplePayReady={isApplePayReady}
                                        isGooglePayReady={isGooglePayReady}
                                        isSamsungPayReady={isSamsungPayReady}></PayButton>
                                </Box>
                            </Box>
                        </Box>
                    </form>
                )}
                <ConfDialog
                    open={alertOpen}
                    title="錯誤"
                    message={message}
                    enMessage={enMessage}
                    onClose={handleCloseAlert}
                    cancelText="關閉"></ConfDialog>

                {loading && (
                    <Box className="loading">
                        <CircularProgress className="loading-icon" />
                    </Box>
                )}
            </div>
        </div>
    );
};

export default CONFGive;