'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ProgressionPoint, LevelProgress } from '@/types/stats';

interface StatsChartProps {
  progressionData: ProgressionPoint[];
  levelProgress?: LevelProgress[];
  type?: 'line' | 'bar';
}

export default function StatsChart({
  progressionData,
  levelProgress,
  type = 'line',
}: StatsChartProps) {
  // Formater les données de progression pour le graphique
  const chartData = progressionData.map((point) => ({
    date: new Date(point.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    }),
    score: Math.round(point.score),
    accuracy: Math.round(point.accuracy * 100) / 100,
  }));

  // Formater les données de progression par niveau
  const levelData =
    levelProgress?.map((level) => ({
      niveau: level.level,
      complété: level.completed,
      total: level.total,
      scoreMoyen: Math.round(level.averageScore),
    })) || [];

  if (type === 'bar' && levelData.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Progression par niveau
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={levelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="niveau" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="complété" fill="#3b82f6" name="Complétées" />
            <Bar dataKey="total" fill="#e5e7eb" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">
          Pas encore de données de progression à afficher
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Évolution des scores
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip
            formatter={(value: number) => `${value}%`}
            labelStyle={{ color: '#374151' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Score (%)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#10b981"
            strokeWidth={2}
            name="Précision (%)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

