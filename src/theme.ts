import { createTheme } from "smarthr-ui";

// ソフィBe Semantic Color を smarthr-ui のテーマにマップする。
// 値は src/tokens.css と同一（smarthr-ui は styled-components 経由のため二重管理。
// 変更時は両方を更新すること — DESIGN.md §2）。
export const theme = createTheme({
  color: {
    MAIN: "#0c2a30", // Accent.Primary = SofyBeBlue.950
    BRAND: "#0c2a30",
    OUTLINE: "#0c2a30", // フォーカスリング
    TEXT_BLACK: "#242828", // Text.Base.Primary = Neutral.Gray.950
    TEXT_GREY: "#606b69", // Text.Base.Secondary = Neutral.Gray.500
    TEXT_DISABLED: "#acb4b2", // Text.Base.Inactive = Neutral.Gray.300
    TEXT_LINK: "#486873", // SofyBeBlue.800
    BORDER: "#e5e8e7", // Border.Main = Neutral.Gray.100
    BACKGROUND: "#f7f9fa", // Background.Main = SofyBeBlue.50
    OVER_BACKGROUND: "#f5f6f6", // Surface.Base.Secondary = Neutral.Gray.50
    COLUMN: "#f5f6f6",
    ACTION_BACKGROUND: "#e5e8e7",
    DANGER: "#dc3826", // Alert.CautionHigh = Red.600
    WARNING_YELLOW: "#fc9f00", // Alert.WarningHigh = Orange.500
    WHITE: "#ffffff",
  },
});
