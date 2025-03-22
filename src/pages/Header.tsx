import { useEffect, useState } from "react";

interface HeaderProps {
    titleHeight: number;
    setTitleHeight: (height: number) => void;
    giveStatus: string;
}

const Header = ({ titleHeight, setTitleHeight, giveStatus }: HeaderProps) => {
    const [scrollOpacity, setScrollOpacity] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // 讓透明度變慢
            const maxScroll = 400;
            const opacity = Math.min(currentScrollY / maxScroll, 1);
            setScrollOpacity(opacity);

            // 計算新的高度
            const newHeight = Math.max(124, 536 - currentScrollY);
            setTitleHeight(newHeight);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [setTitleHeight]);

    return (
        <div
            className="title"
            style={{
                "--scroll-opacity": (giveStatus === "success" || giveStatus === "fail") ? "100" : scrollOpacity,
                height: (giveStatus === "success" || giveStatus === "fail") ? "124px" : `${titleHeight}px`,
            } as React.CSSProperties}
        >
            <div
                className="title-block"
                style={{
                    color: titleHeight < 536 || (giveStatus === "success" || giveStatus === "fail") ? "#F1D984" : "#FFF",
                    bottom: titleHeight < 536 || (giveStatus === "success" || giveStatus === "fail") ? "10px" : "20px",
                }}
            >
                <p className="title-name">
                    {titleHeight < 536 || (giveStatus === "success" || giveStatus === "fail") ? "’25" : "2025"}{" "}
                    <br style={{ display: titleHeight < 536 || (giveStatus === "success" || giveStatus === "fail") ? "none" : "block" }} />
                    THE HOPE 特會
                </p>
                <p className="title-property">GIVING</p>
            </div>
        </div>
    );
};

export default Header;
