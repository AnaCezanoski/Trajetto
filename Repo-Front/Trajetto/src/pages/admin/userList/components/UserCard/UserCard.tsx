import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { User } from '@/types/user';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type UserCardProps = {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
};

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const s = styles(useColors());

  return (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <View style={s.avatarCircle}>
          <Text style={s.avatarEmoji}>👤</Text>
        </View>
        <View style={s.cardInfo}>
          <Text style={s.cardName}>{user.firstName} {user.lastName}</Text>
          <Text style={s.cardEmail}>{user.email}</Text>
          <Text style={s.cardMeta}>{user.country}{user.telephone ? ` · ${user.telephone}` : ''}</Text>
          <View style={[s.roleBadge, user.isAdmin && s.roleBadgeAdmin]}>
            <Text style={[s.roleBadgeText, user.isAdmin && s.roleBadgeTextAdmin]}>
              {user.isAdmin ? '🛡️ Admin' : '👤 Usuário'}
            </Text>
          </View>
        </View>
      </View>
      <View style={s.cardActions}>
        <TouchableOpacity style={s.editBtn} onPress={onEdit} activeOpacity={0.8}>
          <Text style={s.editBtnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
          <Text style={s.deleteBtnIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
