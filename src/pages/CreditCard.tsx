import { useEffect } from "react";
import { TextField } from "@mui/material";
import { FieldErrors, UseFormRegister } from "react-hook-form";


interface CreditCardProps {
    paymentType: string;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
}

const CreditCard: React.FC<CreditCardProps> = (props) => {
    const { paymentType, register, errors } = props;
    useEffect(() => {
        // 只在選擇 credit-card 時執行設置
        if (paymentType === "credit-card") {
            // 設置 TPDirect
            TPDirect.card.setup({
                fields: {
                    number: {
                        element: '#card-number',
                        placeholder: '**** **** **** ****'
                    },
                    expirationDate: {
                        element: document.getElementById('card-expiration-date'),
                        placeholder: 'MM / YY'
                    },
                    ccv: {
                        element: '#card-ccv',
                        placeholder: 'ccv'
                    }
                },
                styles: {
                    'input': {
                        'font-size': '16px',
                        'color': '#070707',
                        'font-family': 'Roboto-light',
                    }
                }
            });
        }
    }, [paymentType]); // 依賴於 paymentType.value 變更來執行

    if (paymentType === "credit-card") {
        return (
            <div className="credit-card-block">
                <div>
                    <p className="label-chinese">持卡人姓名</p>
                    <p className="label-english">Card Holder Name</p>
                    <TextField
                        {...register("name", {
                            required: paymentType === "credit-card" ? "姓名必填" : false,
                        })}
                        sx={{ marginTop: "8px" }}
                        id="outlined-required"
                        className="phone-number width100 basic-formControl"
                        name="name"
                        type="text"
                        error={!!errors.name}
                        helperText={typeof errors.name?.message === 'string' ? errors.name?.message : undefined}
                    />
                </div>
                <div>
                    <p className="label-chinese">信用卡卡號</p>
                    <p className="label-english">Card Number</p>
                    <div className="tpfield width100" id="card-number"></div>
                </div>
                <div className="credit-card-date-ccv-block">
                    <div>
                        <p className="label-chinese">有效日期</p>
                        <p className="label-english">Expiration Date</p>
                        <div className="tpfield width100" id="card-expiration-date"></div>
                    </div>
                    <div>
                        <p className="label-chinese">末三碼</p>
                        <p className="label-english">CCV</p>
                        <div className="tpfield width100" id="card-ccv"></div>
                    </div>
                </div>
            </div>
        );
    };

    return null; // 如果不是 credit-card, 可以返回 null 或其他內容
};

export default CreditCard;
