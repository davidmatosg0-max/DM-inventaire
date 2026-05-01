import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { APP_VERSION, RELEASE_NOTES, type ReleaseNote } from '../version';
import { Package, Calendar, AlertCircle, Shield, Zap, Bug, Lock, RefreshCw } from 'lucide-react';
import { useAutoVersionUpdate } from '../../hooks/useAutoVersionUpdate';
import { Button } from './ui/button';

export function VersionHistory() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'fr' | 'es' | 'en' | 'ar';
  const lang = ['fr', 'es', 'en', 'ar'].includes(currentLang) ? currentLang : 'fr';
  const { currentVersion, shouldRefresh, checkForVersionUpdate } = useAutoVersionUpdate();

  const getVersionTypeColor = (type: ReleaseNote['type']) => {
    const colors = {
      major: 'bg-[#DC3545] text-white',
      minor: 'bg-[#1E73BE] text-white',
      patch: 'bg-[#2d9561] text-white',
      hotfix: 'bg-[#FFC107] text-white'
    };
    return colors[type];
  };

  const getVersionTypeLabel = (type: ReleaseNote['type']) => {
    const key = `organisms.version.history.type.${type}`;
    const translated = t(key);
    // Si la traducción no existe, devolver el tipo en mayúsculas como fallback
    return translated === key ? type.toUpperCase() : translated;
  };

  const getChangeTypeIcon = (type: 'feature' | 'improvement' | 'bugfix' | 'security') => {
    const icons = {
      feature: <Package className="w-4 h-4" />,
      improvement: <Zap className="w-4 h-4" />,
      bugfix: <Bug className="w-4 h-4" />,
      security: <Lock className="w-4 h-4" />
    };
    return icons[type];
  };

  const getChangeTypeColor = (type: 'feature' | 'improvement' | 'bugfix' | 'security') => {
    const colors = {
      feature: 'text-[#1E73BE]',
      improvement: 'text-[#2d9561]',
      bugfix: 'text-[#FFC107]',
      security: 'text-[#DC3545]'
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      {/* Current Version Banner */}
      <Card className="border-l-4 border-l-[#2d9561]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] flex items-center justify-center text-white text-xl">
                🎯
              </div>
              <div>
                <CardTitle className="text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('organisms.version.history.currentVersion')}: {APP_VERSION.version}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {APP_VERSION.releaseDate}
                  <Badge className="ml-2 bg-[#2d9561] text-white">
                    {t('organisms.version.history.build')} {APP_VERSION.buildNumber}
                  </Badge>
                  <Badge className="bg-[#1a4d7a] text-white">
                    {APP_VERSION.environment}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            {shouldRefresh && (
              <Button
                className="bg-[#2d9561] text-white"
                onClick={checkForVersionUpdate}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('organisms.version.history.update')}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Release Notes History */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
            📋 {t('organisms.version.history.title')}
          </CardTitle>
          <CardDescription>
            {t('organisms.version.history.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {RELEASE_NOTES.map((release, index) => (
                <div 
                  key={release.version}
                  className={`border rounded-lg p-6 ${
                    index === 0 ? 'bg-gradient-to-br from-[#E8F5E9] to-white border-[#2d9561]' : 'bg-white'
                  }`}
                >
                  {/* Release Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {index === 0 ? '🎉' : '📦'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {release.title[lang] || release.title.fr}
                          </h3>
                          {index === 0 && (
                            <Badge className="bg-[#2d9561] text-white">
                              {t('organisms.version.history.current')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-mono text-[#1a4d7a]">
                            v{release.version}
                          </span>
                          <Badge className={getVersionTypeColor(release.type)}>
                            {getVersionTypeLabel(release.type)}
                          </Badge>
                          {release.critical && (
                            <Badge className="bg-[#DC3545] text-white">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {t('organisms.version.history.badges.critical')}
                            </Badge>
                          )}
                          {release.breaking && (
                            <Badge className="bg-[#FFC107] text-white">
                              <Shield className="w-3 h-3 mr-1" />
                              {t('organisms.version.history.badges.breaking')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#666666] flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          {release.date}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Release Description */}
                  <p className="text-[#333333] mb-4 leading-relaxed">
                    {release.description[lang] || release.description.fr}
                  </p>

                  {/* Changes List */}
                  <div className="space-y-2">
                    {release.changes.map((change, changeIndex) => (
                      <div 
                        key={changeIndex}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white border border-[#E0E0E0] hover:border-[#2d9561] transition-colors"
                      >
                        <div className={`mt-1 ${getChangeTypeColor(change.type)}`}>
                          {getChangeTypeIcon(change.type)}
                        </div>
                        <p className="text-sm text-[#333333] flex-1">
                          {change.description[lang] || change.description.fr}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}