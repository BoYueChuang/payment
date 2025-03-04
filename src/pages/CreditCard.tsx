import { useEffect } from "react";

const CreditCard = (paymentType: { value: string }) => {
    useEffect(() => {
        // 只在選擇 credit-card 時執行設置
        if (paymentType.value === "credit-card") {
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
                        'color': 'black',
                    },
                    'input.ccv': {
                        'font-size': '16px'
                    },
                    'input.expiration-date': {
                        'font-size': '16px'
                    },
                    'input.card-number': {
                        'font-size': '16px'
                    },
                    ':focus': {
                        'color': 'black'
                    },
                    '.valid': {
                        'color': 'black'
                    },
                    '.invalid': {
                        'color': 'red'
                    }
                }
            });
        }
    }, [paymentType.value]); // 依賴於 paymentType.value 變更來執行

    if (paymentType.value === "credit-card") {
        return (
            <div>
                <div className="tpfield width-300 m-b-15" id="card-number"></div>
                <div className="display-flex space-between m-b-15">
                    <div className="tpfield width-145" id="card-expiration-date"></div>
                    <div className="tpfield width-145" id="card-ccv"></div>
                </div>
            </div>
        );
    };

    return null; // 如果不是 credit-card, 可以返回 null 或其他內容
};

export default CreditCard;
