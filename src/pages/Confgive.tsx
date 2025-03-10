import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { TextField, InputAdornment, Box } from "@mui/material";
import { Checkbox, FormControlLabel } from "@mui/material";
import CreditCard from "./CreditCard";
import ExchangeRate from "./ExchangeRate";
import { useForm, SubmitHandler } from "react-hook-form";
import "./Congive.scss";
import Header from "./Header";
import GiveSucessOrFail from "./GiveSucessOrFail";
import ConfDialog from "./ConfDialog";
import PaymentSelect from "./PaymentSelect";

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
            },
        }
    );
    const [alertOpen, setAlertOpen] = useState(false);
    const [titleHeight, setTitleHeight] = useState(536);
    const [getPaymentType, setPaymentType] = useState("personal");
    const [message, setMessage] = useState("");
    const [giveStatus, setGiveStatus] = useState("form");
    const [isApplePayReady, setIsApplePayReady] = useState(false);
    const [isGooglePayReady, setIsGooglePayReady] = useState(false);
    const [isSamsungPayReady, setIsSamsungPayReady] = useState(false);
    const [isPayError, setPayError] = useState(true);
    const amount = getValues("amount");
    const paymentType = getValues("paymentType");

    // **初始化設定 **
    useEffect(() => {
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
            allowedCountryCodes: ['TW'],
        });
        TPDirect.samsungPay.setup({
            country_code: 'tw'
        })
    }, []);

    useEffect(() => {
        console.log("表單錯誤狀態：", errors, isValid);
        if (isValid) {
            switch (paymentType) {
                case "apple-pay":
                    setIsApplePayReady(true);
                    setupApplePay();
                    break;
                case "google-pay":
                    setIsGooglePayReady(true);
                    setupGooglePay();
                    break;
                case "samsung-pay":
                    setIsSamsungPayReady(true);
                    setupSamSungPay();
                    break;
            };
        } else {
            setIsApplePayReady(false);
            setIsGooglePayReady(false);
            setIsSamsungPayReady(false);
        };
        // eslint-disable-next-line
    }, [errors, isValid]);


    // **提交**
    const onSubmit: SubmitHandler<confGiveProps> = (data) => {
        if (data.paymentType === "credit-card") {
            setupCreditCard();
        };

        console.log("提交表單:", data);
    };


    // **設置 Apple Pay**
    const setupApplePay = async () => {
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
            setPayError(false);
            handleOpenAlert("此裝置不支援 Apple Pay");
            return;
        };

        if (!result.canMakePaymentWithActiveCard) {
            setPayError(false);
            handleOpenAlert("此裝置沒有支援的卡片可以付款");
            return;
        };

        setPayError(true);
        console.log("✅ 該裝置有支援的卡片可以付款");

        const button = document.querySelector("#apple-pay-button-container");
        if (button) {
            TPDirect.paymentRequestApi.setupTappayPaymentButton("#apple-pay-button-container", (getPrimeResult: any) => {
                console.log("Prime 取得成功：", getPrimeResult);
                postPay(getPrimeResult.prime);
            });
        } else {
            setPayError(false);
            console.error("❌ Apple Pay 按鈕未正確插入 DOM");
        };
    };


    // **設置 Google Pay**
    const setupGooglePay = async () => {
        const paymentRequest = {
            allowedNetworks: ["AMEX", "JCB", "MASTERCARD", "VISA"],
            price: amount, // optional
            currency: "TWD", // optional
        }

        TPDirect.googlePay.setupPaymentRequest(paymentRequest, function (result: any) {
            if (result.canUseGooglePay) {
                setPayError(true);
                console.log("✅ 該裝置有支援的卡片可以付款");
                TPDirect.googlePay.setupGooglePayButton({
                    el: "#google-pay-button-container",
                    color: "black",
                    type: "long",
                    getPrimeCallback: function (prime: string) {
                        console.log("Prime 取得成功：", prime);
                        postPay(prime);
                    }
                })
            } else {
                setPayError(false);
                handleOpenAlert("此裝置不支援 Google Pay");
                return;
            };
        });
    }


    // **設置 Samsung Pay**
    const setupSamSungPay = async () => {
        const paymentRequest = {
            supportedNetworks: ['MASTERCARD', 'VISA'],
            total: {
                label: 'The Hope',
                amount: {
                    currency: 'TWD',
                    value: '1.00'
                }
            }
        }
        TPDirect.samsungPay.setupPaymentRequest(paymentRequest)

        setPayError(true);
        console.log("✅ 該裝置有支援的卡片可以付款");

        TPDirect.samsungPay.setupSamsungPayButton('#samsung-pay-button-container', {
            color: 'black',
            type: 'pay',
            shape: 'rectangular'
        }, function (result: any) {
            if (result.status === 0) {
                console.log("✅ 取得 Prime 成功:", result.prime);
                postPay(result.prime);
            } else {
                console.error("❌ 取得 Prime 失敗:", result);
            }
        });
    }


    // **設置 信用卡**
    const setupCreditCard = () => {
        TPDirect.card.getPrime((result: any) => {
            if (result.status !== 0) {
                document.body.style.backgroundColor = "#C4D9D4";
                document.querySelector(".wrapper")?.classList.add("successAndFailWrapper");
                setGiveStatus("fail");
                return;
            };
            // 傳送至後端 API
            postPay(result.card.prime);
        });
    }

    // **傳送至後端 API**
    const postPay = (prime: string) => {
        fetch('https://repo-tappy.vercel.app/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prime: prime,
                amount: Number(amount),
                cardholder: getValues(),
            }),
        })
            .then((res) => res.json())
            .then(() => {
                console.log("✅ 付款成功");
                document.body.style.backgroundColor = "#F1D984";
                document.querySelector(".wrapper")?.classList.add("successAndFailWrapper");
                setGiveStatus("success");
            })
            .catch((error) => {
                console.log("❌ 錯誤：", error);
                document.querySelector(".wrapper")?.classList.add("successAndFailWrapper");
                setGiveStatus("fail");
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
    const handleOpenAlert = (message: string) => {
        setMessage(message);
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
                                        required: "金額必填",
                                        validate: (value) => value > 0 || "金額必須大於 0",
                                    })}
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">NT$</InputAdornment>,
                                        },
                                    }}
                                    className="amount basic-formControl"
                                    type="tel"
                                    error={!!errors.amount}
                                    helperText={errors.amount?.message}
                                />
                                {!isNaN(amount) && amount !== null &&
                                    <ExchangeRate value={amount} />
                                }
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
                                <Box className="phone-block">
                                    <TextField
                                        id="outlined-read-only-input"
                                        {...register("phoneCode", {
                                            required: "國碼必填"
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
                                            required: "電話必填",
                                            validate: (value) => value.length === 9 || "電話號碼必須為 9 碼"
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
                                                {getPaymentType === "personal" && (
                                                    <div>
                                                        <p className="label-chinese">收據姓名</p>
                                                        <p className="label-english">Receipt Name</p>
                                                        <TextField
                                                            id="outlined-required"
                                                            className="receiptName width100 basic-formControl"
                                                            {...register("receiptName", {
                                                                // 當 getPaymentType === "personal" 時，才需要驗證

                                                                required: getPaymentType === "personal" ? "姓名必填" : false,
                                                            })}
                                                            error={!!errors.receiptName}
                                                            helperText={errors.receiptName?.message}
                                                        />
                                                        <p className="contact-information-note">如有報稅需求，請填寫與台灣身分證相符的姓名</p>
                                                    </div>
                                                )}
                                            </>
                                        )
                                        }
                                    </div>
                                    {watch("receipt") && getPaymentType === "company" && (
                                        <div className="company-tax-block">
                                            <div>
                                                <p className="label-chinese">企業登記全名</p>
                                                <p className="label-english">Company's Registered Name</p>
                                                <TextField
                                                    id="outlined-required"
                                                    className="receiptName width100 basic-formControl"
                                                    {...register("company", {
                                                        // 當 getPaymentType === "company" 時，才需要驗證
                                                        required: getPaymentType === "company" ? "企業登記全名必填" : false,
                                                    })}
                                                    error={!!errors.company}
                                                    helperText={errors.company?.message}
                                                />
                                            </div>
                                            <div>
                                                <p className="label-chinese">統一編號</p>
                                                <p className="label-english">Tax ID Number</p>
                                                <TextField
                                                    id="outlined-required"
                                                    className="nationalID width100 basic-formControl"
                                                    {...register("taxid", {
                                                        // 當 getPaymentType === "company" 時，才需要驗證
                                                        required: getPaymentType === "company" ? "統一編號必填" : false,
                                                    })}
                                                    error={!!errors.taxid}
                                                    helperText={errors.taxid?.message}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <FormControlLabel
                                        className="checkbox-label-block"
                                        control={
                                            <Checkbox className="checkbox-custom"
                                                {...register("upload")} />
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
                                                {...register("nationalid", {
                                                    // 當 upload === "true" 時，才需要驗證
                                                    required: watch("upload") ? "身分證字號必填" : false,
                                                })}
                                                error={!!errors.nationalid}
                                                helperText={errors.nationalid?.message}
                                            />
                                        </div>
                                    )}
                                    <PaymentSelect register={register}></PaymentSelect>
                                    <CreditCard paymentType={watch("paymentType")} register={register} errors={errors}></CreditCard>
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
                                </Box>
                            </Box>
                        </Box>
                    </form>
                )}
                <ConfDialog
                    open={alertOpen}
                    title="錯誤"
                    message={message}
                    onClose={handleCloseAlert}
                    cancelText="關閉"></ConfDialog>
            </div>
        </div>
    );
};

export default CONFGive;