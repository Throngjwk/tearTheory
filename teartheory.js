import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "TearTheory";
var name = "Tear Theory";
var description = "created by Karen";
var authors = "Karen";
var version = 1;

var currency;
var adjust, power;
var adjustExp, powerExp;

var achievement1, achievement2;
var chapter1, chapter2, chapter3;

var init = () => {
    currency = theory.createCurrency();
    currency_T = theory.createCurrency("T", "T")

    ///////////////////
    // Regular Upgrades

    // adjust
    {
        let getDesc = (level) => "Adjust a T";
        adjust = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(0, Math.log2(2))));
        adjust.getDescription = (_) => "Adjustig...";
        adjust.getInfo = (amount) => "Adjust a Rho";
    }

    // power
    {
        let getDesc = (level) => "power=formula^{" + level + "}";
        let getInfo = (level) => "power=" + getC2(level).toString(0);
        power = theory.createUpgrade(1, currency, new ExponentialCost(100, Math.log2(10)));
        power.getDescription = (_) => Utils.getMath(getDesc(power.level));
        power.getInfo = (amount) => Utils.getMathTo(getInfo(power.level), getInfo(power.level + amount));
        power.maxLevel = 3;
    }

    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));

    {
        adjustExp = theory.createMilestoneUpgrade(0, 3);
        adjust.description = Localization.getUpgradeIncCustomExpDesc("adjust", "0.05");
        adjust.info = Localization.getUpgradeIncCustomExpInfo("adjust", "0.05");
        adjust.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        powerExp = theory.createMilestoneUpgrade(1, 3);
        powerExp.description = Localization.getUpgradeIncCustomExpDesc("power", "0.05");
        powerExp.info = Localization.getUpgradeIncCustomExpInfo("power", "0.05");
        powerExp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }
    
    /////////////////
    //// Achievements
    achievement1 = theory.createAchievement(0, "Tear", "Start to Tear Theory.", () => adjust.level > 0);
    achievement2 = theory.createAchievement(1, "Prestigudous", "After Power???", () => power.level > 0);

    ///////////////////
    //// Story chapters
    chapter1 = theory.createStoryChapter(0, "Decigolus", "Hello Hello. \nthis get a t the free \ngo this go winning to \nOne Buying this.", () => power.level > 0);
    chapter2 = theory.createStoryChapter(1, "Complex Status", "Yes \nFor \nMe \nyes dont this go anymore getting go?", () => currency.value > 1e6);
    chapter3 = theory.createStoryChapter(2, "Complex Stars Lite", "For do yes me now \nhello \nthis. \never ever?", () => currency.value > 1e8);

    updateAvailability();
}

var updateAvailability = () => {
    powerExp.isAvailable = adjustExp.level > 0;
}

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    if (currency_T.value == 0) {
        // no negative t
    } else {
        currency_T.value -= BigNumber.ONE;
    }
    currency.value += currency_T.value * dt * bonus * getADJUST(adjust.level) *
                                                      getPOWER(power.level);
}

var getPrimaryEquation = () => {
    let result = "\\dot{\\rho} = c_1";

    if (adjustExp.level == 1) result += "^{1.05}";
    if (adjustExp.level == 2) result += "^{1.1}";
    if (adjustExp.level == 3) result += "^{1.15}";

    result += "power";

    if (powerExp.level == 1) result += "^{1.05}";
    if (powerExp.level == 2) result += "^{1.1}";
    if (powerExp.level == 3) result += "^{1.15}";

    return result;
}

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho";
var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.TWO;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value.pow(0.05);
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getADJUST = (level) => currency_T.value = 100;
var getPOWER = (level) => BigNumber.from(currency_T.value.pow(0.5) / 100).pow(level);
var getADJUSTExponent = (level) => BigNumber.from(1 + 0.05 * level);
var getPOWERExponent = (level) => BigNumber.from(1 + 0.05 * level);

init();
