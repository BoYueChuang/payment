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
import Header from "./Header";
import GiveSucessOrFail from "./GiveSucessOrFail";
import ConfDialog from "./ConfDialog";

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
    const { register, handleSubmit, getValues, watch, formState: { errors } } = useForm<confGiveProps>(
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

    const amount = getValues("amount");
    const email = getValues("email");
    // const upload = getValues("upload");
    const phone_number = getValues("phone_number");
    const paymentType = getValues("paymentType");
    const name = getValues("name");

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

        const googlePaySetting = {
            googleMerchantId: import.meta.env.VITE_GOOGLE_MERCHANT_ID,
            allowedCardAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
            merchantName: "TapPay Test!",
            emailRequired: true, // optional
            shippingAddressRequired: true, // optional,
            billingAddressRequired: true, // optional
            billingAddressFormat: "MIN", // FULL, MIN
            allowPrepaidCards: true,
            allowedCountryCodes: ['TW'],
            phoneNumberRequired: true // optional
        }

        TPDirect.googlePay.setupGooglePay(googlePaySetting);
    }, []);


    // **移除付款按鈕**
    const removePayButton = () => {
        const oldButton = document.querySelector("#pr-button-container");
        if (oldButton) {
            oldButton.remove();
        }
    };

    // **初始化 Apple Pay**
    const setupApplePay = () => {
        const paymentRequest = {
            supportedNetworks: ["AMEX", "JCB", "MASTERCARD", "VISA"],
            supportedMethods: ["apple_pay"],
            displayItems: [{ label: "TapPay", amount: { currency: "TWD", value: amount.toString() } }],
            total: { label: "付給 TapPay", amount: { currency: "TWD", value: amount.toString() } },
        };

        TPDirect.paymentRequestApi.setupPaymentRequest(paymentRequest, function (result: any) {
            if (!result.browserSupportPaymentRequest) {
                handleOpenAlert("此裝置不支援 Apple Pay");
                return;
            };

            if (result.canMakePaymentWithActiveCard) {
                console.log("✅ 該裝置有支援的卡片可以付款");

                // **確保 container 存在**
                const container = document.getElementById("pr-button-container");
                if (!container) {
                    console.error("❌ 找不到 #pr-button-container");
                    return;
                }

                // **動態插入 Apple Pay 按鈕**
                const newButton = document.createElement("div");
                newButton.id = "pr-button";
                container.appendChild(newButton);

                const button = document.getElementById("pr-button");
                if (button) {
                    TPDirect.paymentRequestApi.setupTappayPaymentButton("#pr-button", (getPrimeResult: any) => {
                        console.log("Prime 取得成功：", getPrimeResult);
                        postPay(getPrimeResult.prime);
                    });
                } else {
                    console.error("❌ Apple Pay 按鈕未正確插入 DOM");
                };
            } else {
                handleOpenAlert("此裝置沒有支援的卡片可以付款");
            };
        });
    };

    const setupGooglePay = () => {
        var paymentRequest = {
            allowedNetworks: ["AMEX", "JCB", "MASTERCARD", "VISA"],
            price: "123", // optional
            currency: "TWD", // optional
        }

        TPDirect.googlePay.setupPaymentRequest(paymentRequest, function (result: any) {
            if (result.canUseGooglePay) {
                TPDirect.googlePay.setupGooglePayButton({
                    el: "#pr-button-container",
                    color: "black",
                    type: "long",
                    getPrimeCallback: function (prime: string) {
                        console.log("Prime 取得成功：", prime);
                        postPay(prime);
                    }
                })
            } else {
                console.log("❌ 無法使用 Google Pay");
            };
        })
    }

    // 輸入框內禁止輸入 0 開頭
    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 如果輸入的值是 0 開頭，去掉 0
        if (value.startsWith('0')) {
            e.target.value = value.slice(1);
        };
    };

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

    // onSubmit 會在表單提交時被調用
    const onSubmit: SubmitHandler<confGiveProps> = (data) => {
        if (data.paymentType === "apple-pay") {
            setupApplePay();
        } else if (data.paymentType === "google-pay") {
            setupGooglePay();
        } else if (data.paymentType === "credit-card") {
            setupCreditCard();
        } else {
            removePayButton();
        };
    };

    useEffect(() => {
        const button = document.getElementById("pr-button");
        if (button) {
            button.addEventListener("click", handleApplePayClick);
        }

        return () => {
            if (button) {
                button.removeEventListener("click", handleApplePayClick);
            }
        };
    }, []);

    const handleApplePayClick = () => {
        console.log("🍏 Apple Pay 按鈕被點擊！");
        // 你可以在這裡執行額外的檢查，例如表單驗證
    };

    const handleOpenAlert = (message: string) => {
        setMessage(message);
        setAlertOpen(true);
    };

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
                                    {paymentType === "credit-card" && (
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            className="continue-button width100">
                                            CONTINUE
                                        </Button>
                                    )}
                                    {paymentType === "apple-pay" && (
                                        <div id="pr-button-container"></div>
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