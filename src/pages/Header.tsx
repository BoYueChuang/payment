import { useEffect, useState } from "react";

interface HeaderProps {
    titleHeight: number;
    setTitleHeight: (height: number) => void;
}

const Header = ({ titleHeight, setTitleHeight }: HeaderProps) => {
    const [scrollOpacity, setScrollOpacity] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // 让透明度变慢
            const maxScroll = 400;
            const opacity = Math.min(currentScrollY / maxScroll, 1);
            setScrollOpacity(opacity);

            // 计算新的高度
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
                "--scroll-opacity": scrollOpacity, // CSS 变量
                height: `${titleHeight}px`, // **这里不会报错了**
            } as React.CSSProperties}
        >
            <div
                className="title-block"
                style={{
                    color: titleHeight < 536 ? "#F1D984" : "#FFF",
                    bottom: titleHeight < 536 ? "10px" : "20px",
                }}
            >
                <p className="title-name">
                    {titleHeight < 536 ? "’25" : "2025"}{" "}
                    <br style={{ display: titleHeight < 536 ? "none" : "block" }} />
                    {titleHeight < 536 ? "THE HOPE Conference" : "THE HOPE 特會"}
                </p>
                <p className="title-property">GIVE</p>
            </div>
        </div>
    );
};

export default Header;
