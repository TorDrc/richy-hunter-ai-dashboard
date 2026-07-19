// ============================================================================
// RICHY HUNTER AI v16 INSTITUTIONAL
// Quant Engine Weight Profiles
// ============================================================================

export const WEIGHTS={

CONSERVATIVE:{

LIQUIDITY:0.20,
VOLUME:0.10,
MOMENTUM:0.05,
SECURITY:0.25,
DISTRIBUTION:0.15,
SMART_MONEY:0.10,
WHALES:0.05,
CREATOR:0.05,
AGE:0.03,
INSIDER:0.02

},

BALANCED:{

LIQUIDITY:0.15,
VOLUME:0.12,
MOMENTUM:0.10,
SECURITY:0.18,
DISTRIBUTION:0.10,
SMART_MONEY:0.12,
WHALES:0.08,
CREATOR:0.07,
AGE:0.05,
INSIDER:0.03

},

AGGRESSIVE:{

LIQUIDITY:0.10,
VOLUME:0.15,
MOMENTUM:0.18,
SECURITY:0.12,
DISTRIBUTION:0.08,
SMART_MONEY:0.15,
WHALES:0.10,
CREATOR:0.05,
AGE:0.04,
INSIDER:0.03

},

INSTITUTIONAL:{

LIQUIDITY:0.14,
VOLUME:0.10,
MOMENTUM:0.09,
SECURITY:0.18,
DISTRIBUTION:0.10,
SMART_MONEY:0.15,
WHALES:0.08,
CREATOR:0.06,
AGE:0.05,
INSIDER:0.05

}

};


export const ACTIVE_PROFILE="INSTITUTIONAL";


export function getWeights(profile=ACTIVE_PROFILE){

return WEIGHTS[profile]||WEIGHTS.INSTITUTIONAL;

}


export function validateWeights(weights){

const total=Object.values(weights)
.reduce((sum,value)=>sum+value,0);

return Math.abs(total-1)<0.001;

}


export default WEIGHTS;
