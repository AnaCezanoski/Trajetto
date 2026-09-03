import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type AdminBannersProps = {
  onPressUsers: () => void;
  onPressDashboard: () => void;
};

export default function AdminBanners({ onPressUsers, onPressDashboard }: AdminBannersProps) {
  const s = styles(useColors());
  return (
    <>
      <TouchableOpacity style={s.adminBanner} onPress={onPressUsers} activeOpacity={0.8}>
        <Text style={s.bannerIcon}>🛡️</Text>
        <Text style={s.adminBannerText}>Painel Administrador</Text>
        <Text style={s.adminBannerArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.dashboardBanner} onPress={onPressDashboard} activeOpacity={0.8}>
        <Text style={s.bannerIcon}>📊</Text>
        <Text style={s.dashboardBannerText}>Dashboard de uso</Text>
        <Text style={s.dashboardBannerArrow}>›</Text>
      </TouchableOpacity>
    </>
  );
}
