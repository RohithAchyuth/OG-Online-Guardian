import avatarImg from './images/avatar_security_analyst_1791793610679.jpg';
import avatarFemaleAnalyst from './images/avatar_female_analyst_1791863182302.jpg';
import avatarTechDirector from './images/avatar_tech_director_1791863196840.jpg';
import avatarCisoLeader from './images/avatar_ciso_leader_1791863217590.jpg';
import avatarThreatHunter from './images/avatar_threat_hunter_1791863241074.jpg';
import heroNetworkImg from './images/hero_cybersecurity_network_1791793575816.jpg';
import loginMeshImg from './images/login_security_mesh_1791793587555.jpg';
import novaPayLogoImg from './images/novapay_brand_logo_1791793598241.jpg';
import onlineGuardianLogoImg from './images/online_guardian_logo_1791865294373.jpg';

export interface PresetAvatar {
  id: string;
  name: string;
  role: string;
  url: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'analyst-male',
    name: 'Cybersecurity Threat Evaluator',
    role: 'Lead Security Analyst',
    url: avatarImg,
  },
  {
    id: 'analyst-female',
    name: 'Operations Specialist',
    role: 'SOC Analyst & Operations',
    url: avatarFemaleAnalyst,
  },
  {
    id: 'tech-director',
    name: 'Executive Tech Director',
    role: 'Head of Infrastructure & SecOps',
    url: avatarTechDirector,
  },
  {
    id: 'ciso-executive',
    name: 'Chief Information Security Officer',
    role: 'Enterprise CISO',
    url: avatarCisoLeader,
  },
  {
    id: 'threat-hunter',
    name: 'Tactical Threat Hunter',
    role: 'Dark Web & Social Prober',
    url: avatarThreatHunter,
  },
];

export {
  avatarImg,
  avatarFemaleAnalyst,
  avatarTechDirector,
  avatarCisoLeader,
  avatarThreatHunter,
  heroNetworkImg,
  loginMeshImg,
  novaPayLogoImg,
  onlineGuardianLogoImg,
};
