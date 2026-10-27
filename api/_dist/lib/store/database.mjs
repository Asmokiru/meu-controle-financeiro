import crypto from 'node:crypto';
import {
  encryptAtRest,
  decryptAtRest,
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  hashToken,
  generateSecureToken,
  maskIpAddress,
  sanitizeForAuditLog,
  createSignedAttachmentUrl,
} from '../security/crypto.mjs';
import {
  generateTotpSecret,
  verifyTotpCode,
  buildOtpAuthUri,
  generateBackupCodes,
} from '../security/totp.mjs';
import {
  INITIAL_CATEGORIES,
  classifyTransactionDescription,
  learnCategoryCorrection,
} from '../finance/smart-classifier.mjs';
import {
  analyzeMonthlyBudget,
  calculateGoalProjection,
  simulateDebtPayoff,
} from '../finance/simulators.mjs';
import { formatBRLFromCents } from '../finance/formatters.mjs';

export class ForbiddenAccessError extends Error {
                  statusCode = 403;
  constructor(message = 'Acesso negado: recurso pertence a outro usuário ou não existe.') {
    super(message);
    this.name = 'ForbiddenAccessError';
  }
}

export class AuthenticationError extends Error {
                  statusCode = 401;
  constructor(message = 'Credenciais inválidas ou sessão expirada.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
                  statusCode = 400;
  constructor(message        ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Tipagens das 22 Entidades do Modelo de Dados
// ============================================================================

                             
             
               
                
                       
                         
                                        
                                          
                                        
                                      
                              
                             
                                     
                                      
                         
                    
                    
 

                                    
             
                 
                                      
                              
                                             
                      
                                    
                            
                                             
                               
                               
                             
                                               
                                   
                    
                    
 

                                
             
                 
                         
                           
                             
                  
             
                     
                              
                          
                       
                     
                               
                       
                    
                    
 

                                         
             
                 
                     
                              
                              
                            
                            
                    
                    
 

                                
             
                 
               
       
                
               
                   
                       
                  
                       
                          
                              
                              
                
               
                      
                    
                    
 

                                   
             
                 
               
                
                         
                          
                     
                 
                            
                
                      
                    
                    
 

                                 
             
                 
               
               
                                                                          
               
                
                    
                       
                     
                    
 

                                    
             
                 
                     
               
                    
 

                                    
             
                 
                                                                          
                      
                         
                         
                                 
                                      
                              
                     
                               
                      
                
            
           
             
              
              
                
              
                                                       
                                                                  
                           
                 
                
                          
                            
                           
                    
                    
 

                                               
             
                 
                        
                              
                            
                            
                      
                  
                         
                                                       
                    
 

                               
             
                 
                     
                               
                         
                             
                    
                    
 

                             
             
                 
                           
               
                            
                             
                     
                                     
                                                   
               
                
                    
                    
 

                                         
             
                 
                 
                      
                           
               
                    
 

                             
             
                 
               
                   
                           
                               
                                
                            
                           
                                 
                      
                                                            
                                              
                    
                    
 

                                    
             
                 
                 
                      
                               
                      
               
                    
 

                                     
             
                 
       
                    
                    
                        
                       
                   
                              
                    
                       
                                 
                       
                       
                
                  
                           
                  
                       
                    
 

                                               
             
                 
                                   
                                                
                     
                    
 

                                   
             
                 
                        
                   
                   
                        
                         
                           
                    
 

                                 
             
                 
                 
                       
                            
                          
                    
                            
                    
 

                                      
             
                 
                      
                       
                        
                   
                    
                           
                          
 

                                          
             
                 
                                          
                                                                        
                            
                    
                      
                             
 

                                      
             
                        
                    
                                                            
                      
                          
                    
                    
 

// ============================================================================
// Banco de Dados em Memória / Persistência Estruturada com Isolamento de Tenant
// ============================================================================

export class FinancialPlatformStore {
         users = new Map                    ();
         userProfiles = new Map                           ();
         sessions = new Map                       ();
         mfaConfigs = new Map                                ();
         accounts = new Map                       ();
         creditCards = new Map                          ();
         categories = new Map                        ();
         subcategories = new Map                           ();
         transactions = new Map                           ();
         installments = new Map                                      ();
         budgets = new Map                      ();
         goals = new Map                    ();
         goalContributions = new Map                                ();
         debts = new Map                    ();
         debtPayments = new Map                           ();
         notifications = new Map                            ();
         notificationPreferences = new Map                                      ();
         attachments = new Map                          ();
         auditLogs                   = [];
         consentRecords = new Map                             ();
         dataExportRequests = new Map                                 ();
         securityEvents                        = [];

  // --------------------------------------------------------------------------
  // Auditoria e Segurança
  // --------------------------------------------------------------------------

         recordAudit(params   
                   
                   
                         
                               
                
                       
                                       
   )                 {
    const entry                 = {
      id: crypto.randomUUID(),
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId || null,
      ipAddressMasked: maskIpAddress(params.ip || '127.0.0.1'),
      userAgent: (params.userAgent || 'WebBrowser/1.0').slice(0, 255),
      metadataSanitized: sanitizeForAuditLog(params.metadata || {}),
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

         recordSecurityEvent(params   
                           
                      
                                              
                        
                
   )                      {
    const ev                      = {
      id: crypto.randomUUID(),
      userId: params.userId || null,
      eventType: params.eventType,
      severity: params.severity,
      description: params.description,
      ipAddressMasked: maskIpAddress(params.ip || '127.0.0.1'),
      resolved: false,
      createdAt: new Date().toISOString(),
    };
    this.securityEvents.unshift(ev);
    return ev;
  }

          assertOwnership(
    resourceUserId                    ,
    actorUserId        ,
    resourceType        ,
    resourceId        
  )       {
    if (!resourceUserId || resourceUserId !== actorUserId) {
      this.recordSecurityEvent({
        userId: actorUserId,
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        severity: 'HIGH',
        description: `Tentativa bloqueada de acesso cruzado (IDOR) ao recurso ${resourceType}:${resourceId}`,
      });
      throw new ForbiddenAccessError();
    }
  }

  // --------------------------------------------------------------------------
  // 1. Cadastro, Login, Recuperação de Senha, MFA e Sessões
  // --------------------------------------------------------------------------

         registerUser(params   
                 
                  
                     
                                     
                
                            
   )                                                                        {
    if (!params.acceptedTermsAndPrivacy) {
      throw new ValidationError(
        'É necessário aceitar os Termos de Uso e a Política de Privacidade (LGPD) para criar sua conta.'
      );
    }

    const cleanEmail = (params.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new ValidationError('Informe um endereço de e-mail válido.');
    }

    const existing = Array.from(this.users.values()).find(
      (u) => u.email === cleanEmail
    );
    if (existing) {
      // Mensagem genérica segura contra enumeração de contas
      throw new ValidationError(
        'Não foi possível concluir o cadastro com os dados informados. Verifique o e-mail ou tente recuperar o acesso.'
      );
    }

    const strength = validatePasswordStrength(params.password);
    if (!strength.valid) {
      throw new ValidationError(strength.errors.join(' '));
    }

    const now = new Date().toISOString();
    const verificationToken = generateSecureToken(24);
    const userId = crypto.randomUUID();

    const user             = {
      id: userId,
      name: params.name.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(params.password),
      emailVerified: Boolean(params.isDemoAccount),
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: new Date(Date.now() + 24 * 3600_000).toISOString(),
      passwordResetTokenHash: null,
      passwordResetExpires: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      deletionRequestedAt: null,
      deletionScheduledFor: null,
      isDemoAccount: Boolean(params.isDemoAccount),
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(userId, user);

    // Perfil Inicial (Onboarding pendente)
    const profile                    = {
      id: crypto.randomUUID(),
      userId,
      estimatedMonthlyIncomeCents: 0,
      encryptedIncomeData: encryptAtRest(JSON.stringify({ estimatedMonthlyIncomeCents: 0 })),
      incomeType: 'FIXED',
      mainGoals: [],
      fixedMonthlyExpensesCents: 0,
      hasExistingDebts: false,
      budgetControlMode: 'INDIVIDUAL',
      relevantCategories: [],
      onboardingCompleted: false,
      onboardingSkipped: false,
      themePreference: 'system',
      learnedCategoryRulesJson: '{}',
      createdAt: now,
      updatedAt: now,
    };
    this.userProfiles.set(userId, profile);

    // Categorias e Subcategorias iniciais
    this.seedInitialCategoriesForUser(userId);

    // Preferências de Notificação iniciais
    const notificationTypes                               = [
      'UPCOMING_DUE',
      'OVERDUE_BILL',
      'BUDGET_THRESHOLD',
      'UNUSUAL_EXPENSE',
      'LOW_BALANCE',
      'NEW_RECURRING_DETECTED',
      'GOAL_REACHED',
      'WEEKLY_REMINDER',
      'DUPLICATE_PAYMENT_WARNING',
      'HIGH_CARD_USAGE',
      'SECURITY_ALERT',
    ];
    for (const type of notificationTypes) {
      const prefId = crypto.randomUUID();
      this.notificationPreferences.set(prefId, {
        id: prefId,
        userId,
        type,
        channel: 'BOTH',
        isEnabled: true,
        updatedAt: now,
      });
    }

    // Registro de Consentimento LGPD
    const defaultConsents = [
      {
        code: 'TERMS_AND_PRIVACY',
        title: 'Termos de Uso e Política de Privacidade (Execução de Contrato)',
        granted: true,
      },
      {
        code: 'SECURITY_NOTIFICATIONS',
        title: 'Alertas críticos de segurança e novos logins por e-mail',
        granted: true,
      },
      {
        code: 'LOCAL_SMART_CATEGORIZATION',
        title: 'Aprendizado local de categorização automática (isolado na própria conta)',
        granted: true,
      },
      {
        code: 'EXTERNAL_AI_TRAINING',
        title: 'Uso de dados para treinamento externo de modelos de IA (Desativado por padrão)',
        granted: false,
      },
    ];
    for (const c of defaultConsents) {
      const cid = crypto.randomUUID();
      this.consentRecords.set(cid, {
        id: cid,
        userId,
        purposeCode: c.code,
        purposeTitle: c.title,
        policyVersion: '2026.1',
        granted: c.granted,
        grantedAt: now,
        revokedAt: null,
        ipAddressMasked: maskIpAddress(params.ip || '127.0.0.1'),
      });
    }

    this.recordAudit({
      userId,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: userId,
      ip: params.ip,
      metadata: { emailVerified: user.emailVerified },
    });

    const { passwordHash: _omitted, ...safeUser } = user;
    return { user: safeUser, verificationToken };
  }

         verifyEmail(token        )          {
    const tokenHash = hashToken(token);
    const user = Array.from(this.users.values()).find(
      (u) => u.emailVerificationToken === tokenHash
    );
    if (!user) return false;
    if (
      user.emailVerificationExpires &&
      new Date(user.emailVerificationExpires).getTime() < Date.now()
    ) {
      return false;
    }
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    user.updatedAt = new Date().toISOString();
    this.recordAudit({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      resourceType: 'User',
      resourceId: user.id,
    });
    return true;
  }

         login(params   
                  
                     
                      
                     
                
                        
                                 
                
   )   
                         
                            
                         
                          
                                            
    {
    const cleanEmail = (params.email || '').trim().toLowerCase();
    const user = Array.from(this.users.values()).find(
      (u) => u.email === cleanEmail
    );

    // Previne enumeração de usuários mantendo resposta uniforme
    if (!user) {
      hashPassword('dummy-timing-equalization-password-123!A');
      throw new AuthenticationError('E-mail ou senha incorretos.');
    }

    // Verifica bloqueio temporário contra força bruta
    if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
      this.recordSecurityEvent({
        userId: user.id,
        eventType: 'BRUTE_FORCE_LOCKED_ATTEMPT',
        severity: 'MEDIUM',
        description: 'Tentativa de login durante período de bloqueio temporário.',
        ip: params.ip,
      });
      throw new AuthenticationError(
        'Conta temporariamente bloqueada por múltiplas tentativas incorretas. Tente novamente em alguns minutos.'
      );
    }

    const passwordValid = verifyPassword(params.password, user.passwordHash);
    if (!passwordValid) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60_000).toISOString();
        this.recordSecurityEvent({
          userId: user.id,
          eventType: 'ACCOUNT_LOCKED_BRUTE_FORCE',
          severity: 'HIGH',
          description: 'Conta bloqueada por 15 minutos após 5 tentativas de senha inválidas.',
          ip: params.ip,
        });
      }
      throw new AuthenticationError('E-mail ou senha incorretos.');
    }

    // Verifica MFA se habilitado
    const mfa = this.mfaConfigs.get(user.id);
    if (mfa && mfa.isEnabled) {
      if (!params.totpCode) {
        return { requiresMfa: true };
      }
      const secret = decryptAtRest(mfa.encryptedTotpSecret);
      const isTotpOk = verifyTotpCode(secret, params.totpCode);
      const backupHash = hashToken(params.totpCode.trim().toUpperCase());
      const backupIdx = mfa.backupCodesHashed.indexOf(backupHash);

      if (!isTotpOk && backupIdx === -1) {
        this.recordSecurityEvent({
          userId: user.id,
          eventType: 'MFA_FAILED',
          severity: 'MEDIUM',
          description: 'Código MFA/2FA inválido fornecido durante login.',
          ip: params.ip,
        });
        throw new AuthenticationError('Código de autenticação em duas etapas (2FA) inválido.');
      }

      if (backupIdx !== -1) {
        // Consome código de backup de uso único
        mfa.backupCodesHashed.splice(backupIdx, 1);
      }
      mfa.lastUsedAt = new Date().toISOString();
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    const accessToken = generateSecureToken(32);
    const refreshToken = generateSecureToken(48);
    const now = new Date().toISOString();

    const session                = {
      id: crypto.randomUUID(),
      userId: user.id,
      accessTokenJti: hashToken(accessToken),
      refreshTokenHash: hashToken(refreshToken),
      refreshTokenFamily: crypto.randomUUID(),
      browser: params.browser || 'Chrome 132',
      os: params.os || 'Windows 11',
      deviceName: params.deviceName || ' Computador Pessoal',
      approximateLocation: params.approximateLocation || 'São Paulo, SP, Brasil',
      ipAddressMasked: maskIpAddress(params.ip || '177.42.10.20'),
      mfaVerified: Boolean(mfa?.isEnabled),
      isRevoked: false,
      revokedReason: null,
      lastActiveAt: now,
      expiresAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
      createdAt: now,
    };

    this.sessions.set(session.id, session);

    // Notificação de segurança sobre novo login
    this.createNotification({
      userId: user.id,
      type: 'SECURITY_ALERT',
      title: 'Novo acesso detectado na sua conta',
      message: `Novo login realizado via ${session.browser} (${session.os}) em ${session.approximateLocation}. Se não foi você, encerre todas as sessões imediatamente.`,
      sentByEmail: true,
    });

    this.recordAudit({
      userId: user.id,
      action: 'USER_LOGIN_SUCCESS',
      resourceType: 'Session',
      resourceId: session.id,
      ip: params.ip,
      metadata: {
        mfaVerified: session.mfaVerified,
        device: session.deviceName,
        location: session.approximateLocation,
      },
    });

    const { passwordHash: _omitted, ...safeUser } = user;
    return {
      requiresMfa: false,
      session,
      accessToken,
      refreshToken,
      user: safeUser,
    };
  }

         rotateRefreshToken(oldRefreshToken        )   
                        
                         
                           
    {
    const oldHash = hashToken(oldRefreshToken);
    const session = Array.from(this.sessions.values()).find(
      (s) => s.refreshTokenHash === oldHash
    );
    if (!session) {
      throw new AuthenticationError('Refresh token inválido.');
    }
    if (session.isRevoked) {
      // Detecção de reuso de Refresh Token: revoga toda a família de sessões do usuário!
      for (const s of this.sessions.values()) {
        if (s.userId === session.userId) {
          s.isRevoked = true;
          s.revokedReason = 'REFRESH_TOKEN_REUSE_DETECTED';
        }
      }
      this.recordSecurityEvent({
        userId: session.userId,
        eventType: 'REFRESH_TOKEN_REUSE_DETECTED',
        severity: 'CRITICAL',
        description:
          'Reutilização de refresh token revogado detectada. Todas as sessões foram invalidadas preventivamente.',
      });
      throw new AuthenticationError('Sessão revogada por alerta de segurança.');
    }

    const newAccess = generateSecureToken(32);
    const newRefresh = generateSecureToken(48);
    session.accessTokenJti = hashToken(newAccess);
    session.refreshTokenHash = hashToken(newRefresh);
    session.lastActiveAt = new Date().toISOString();

    return { accessToken: newAccess, refreshToken: newRefresh, session };
  }

         setupMfa(userId        )   
                         
                       
                          
    {
    const user = this.users.get(userId);
    if (!user) throw new AuthenticationError();

    const secretBase32 = generateTotpSecret();
    const otpAuthUri = buildOtpAuthUri(user.email, secretBase32);
    const { plainCodes, hashedCodes } = generateBackupCodes(8);
    const now = new Date().toISOString();

    this.mfaConfigs.set(userId, {
      id: crypto.randomUUID(),
      userId,
      isEnabled: false,
      encryptedTotpSecret: encryptAtRest(secretBase32),
      backupCodesHashed: hashedCodes,
      verifiedAt: null,
      lastUsedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    return { secretBase32, otpAuthUri, backupCodes: plainCodes };
  }

         verifyAndEnableMfa(userId        , code        )          {
    const mfa = this.mfaConfigs.get(userId);
    if (!mfa) throw new ValidationError('Configuração MFA não iniciada.');
    const secret = decryptAtRest(mfa.encryptedTotpSecret);
    if (!verifyTotpCode(secret, code)) {
      throw new ValidationError('Código TOTP incorreto. Verifique o horário do seu dispositivo.');
    }
    const now = new Date().toISOString();
    mfa.isEnabled = true;
    mfa.verifiedAt = now;
    mfa.updatedAt = now;

    this.recordAudit({
      userId,
      action: 'MFA_ENABLED',
      resourceType: 'MFAConfiguration',
      resourceId: mfa.id,
    });

    this.createNotification({
      userId,
      type: 'SECURITY_ALERT',
      title: 'Autenticação em duas etapas (2FA) ativada',
      message: 'A verificação em duas etapas por aplicativo autenticador (TOTP) foi habilitada com sucesso na sua conta.',
      sentByEmail: true,
    });

    return true;
  }

         requestPasswordReset(email        )                                {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = Array.from(this.users.values()).find(
      (u) => u.email === cleanEmail
    );
    if (!user) {
      // Não revela se o e-mail existe ou não
      return { resetToken: null };
    }
    const rawToken = generateSecureToken(32);
    user.passwordResetTokenHash = hashToken(rawToken);
    // Expiração curta de 15 minutos
    user.passwordResetExpires = new Date(Date.now() + 15 * 60_000).toISOString();

    this.recordAudit({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      resourceType: 'User',
      resourceId: user.id,
    });

    return { resetToken: rawToken };
  }

         resetPasswordWithToken(params   
                  
                        
   )          {
    const tokenHash = hashToken(params.token);
    const user = Array.from(this.users.values()).find(
      (u) => u.passwordResetTokenHash === tokenHash
    );
    if (
      !user ||
      !user.passwordResetExpires ||
      new Date(user.passwordResetExpires).getTime() < Date.now()
    ) {
      throw new ValidationError('Token de recuperação inválido ou expirado.');
    }

    const strength = validatePasswordStrength(params.newPassword);
    if (!strength.valid) {
      throw new ValidationError(strength.errors.join(' '));
    }

    user.passwordHash = hashPassword(params.newPassword);
    // Uso único: invalida o token imediatamente
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    user.updatedAt = new Date().toISOString();

    // Revoga todas as sessões ativas após troca de senha
    this.revokeAllUserSessions(user.id, 'PASSWORD_CHANGED');

    this.createNotification({
      userId: user.id,
      type: 'SECURITY_ALERT',
      title: 'Sua senha foi alterada',
      message:
        'A senha da sua conta foi redefinida e todas as sessões anteriores foram encerradas por segurança.',
      sentByEmail: true,
    });

    this.recordAudit({
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      resourceType: 'User',
      resourceId: user.id,
    });

    return true;
  }

         revokeSession(userId        , sessionId        )       {
    const session = this.sessions.get(sessionId);
    this.assertOwnership(session?.userId, userId, 'Session', sessionId);
    if (session) {
      session.isRevoked = true;
      session.revokedReason = 'USER_LOGOUT_DEVICE';
      this.recordAudit({
        userId,
        action: 'SESSION_REVOKED',
        resourceType: 'Session',
        resourceId: sessionId,
      });
    }
  }

         revokeAllUserSessions(
    userId        ,
    reason = 'USER_TERMINATED_ALL_SESSIONS'
  )         {
    let count = 0;
    for (const s of this.sessions.values()) {
      if (s.userId === userId && !s.isRevoked) {
        s.isRevoked = true;
        s.revokedReason = reason;
        count++;
      }
    }
    this.recordAudit({
      userId,
      action: 'ALL_SESSIONS_REVOKED',
      resourceType: 'Session',
      metadata: { revokedCount: count, reason },
    });
    return count;
  }

         getUserSessions(userId        )                  {
    return Array.from(this.sessions.values()).filter(
      (s) => s.userId === userId && !s.isRevoked
    );
  }

  // --------------------------------------------------------------------------
  // 2. Onboarding Financeiro e Categorias
  // --------------------------------------------------------------------------

          seedInitialCategoriesForUser(userId        )       {
    const now = new Date().toISOString();
    for (const item of INITIAL_CATEGORIES) {
      const catId = crypto.randomUUID();
      this.categories.set(catId, {
        id: catId,
        userId,
        name: item.name,
        slug: item.slug,
        type: item.type,
        icon: item.icon,
        color: item.color,
        isSystem: true,
        isFixedCost: item.isFixedCost,
        keywords: [...item.keywords],
        createdAt: now,
      });

      for (const subName of item.subcategories) {
        const subId = crypto.randomUUID();
        this.subcategories.set(subId, {
          id: subId,
          userId,
          categoryId: catId,
          name: subName,
          createdAt: now,
        });
      }
    }
  }

         updateOnboardingProfile(
    userId        ,
    data           
                                          
                                                 
                          
                                        
                                
                                                 
                                   
                                   
                                 
                                                   
      
  )                    {
    const profile = this.userProfiles.get(userId);
    if (!profile) throw new ForbiddenAccessError();

    if (data.estimatedMonthlyIncomeCents !== undefined) {
      profile.estimatedMonthlyIncomeCents = data.estimatedMonthlyIncomeCents;
      profile.encryptedIncomeData = encryptAtRest(
        JSON.stringify({
          estimatedMonthlyIncomeCents: data.estimatedMonthlyIncomeCents,
        })
      );
    }
    if (data.incomeType) profile.incomeType = data.incomeType;
    if (data.mainGoals) profile.mainGoals = data.mainGoals;
    if (data.fixedMonthlyExpensesCents !== undefined) {
      profile.fixedMonthlyExpensesCents = data.fixedMonthlyExpensesCents;
    }
    if (data.hasExistingDebts !== undefined) {
      profile.hasExistingDebts = data.hasExistingDebts;
    }
    if (data.budgetControlMode) {
      profile.budgetControlMode = data.budgetControlMode;
    }
    if (data.relevantCategories) {
      profile.relevantCategories = data.relevantCategories;
    }
    if (data.onboardingCompleted !== undefined) {
      profile.onboardingCompleted = data.onboardingCompleted;
    }
    if (data.onboardingSkipped !== undefined) {
      profile.onboardingSkipped = data.onboardingSkipped;
    }
    if (data.themePreference) {
      profile.themePreference = data.themePreference;
    }
    profile.updatedAt = new Date().toISOString();

    this.recordAudit({
      userId,
      action: 'PROFILE_UPDATED',
      resourceType: 'UserProfile',
      resourceId: profile.id,
    });

    return profile;
  }

  // --------------------------------------------------------------------------
  // 3. Contas, Carteiras e Cartões de Crédito
  // --------------------------------------------------------------------------

         createAccount(
    userId        ,
    input   
                   
                                  
                               
                                  
                     
                    
     
  )                {
    const now = new Date().toISOString();
    const account                = {
      id: crypto.randomUUID(),
      userId,
      name: input.name.trim(),
      type: input.type,
      institutionName: input.institutionName || 'Instituição',
      initialBalanceCents: input.initialBalanceCents,
      currentBalanceCents: input.initialBalanceCents,
      color: input.color || '#0F766E',
      icon: input.icon || 'wallet',
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.accounts.set(account.id, account);
    return account;
  }

         getUserAccounts(userId        )                  {
    return Array.from(this.accounts.values()).filter(
      (a) => a.userId === userId && !a.isArchived
    );
  }

         updateAccount(
    userId        ,
    accountId        ,
    updates                                                                         
  )                {
    const acc = this.accounts.get(accountId);
    this.assertOwnership(acc?.userId, userId, 'Account', accountId);
    if (!acc) throw new ForbiddenAccessError();
    if (updates.name !== undefined) acc.name = updates.name.trim();
    if (updates.institutionName !== undefined) {
      acc.institutionName = updates.institutionName.trim();
    }
    if (updates.isArchived !== undefined) acc.isArchived = updates.isArchived;
    acc.updatedAt = new Date().toISOString();
    return acc;
  }

         deleteAccount(userId        , accountId        )       {
    const acc = this.accounts.get(accountId);
    this.assertOwnership(acc?.userId, userId, 'Account', accountId);
    if (!acc) throw new ForbiddenAccessError();
    this.accounts.delete(accountId);
  }

         createCreditCard(
    userId        ,
    input   
                   
                     
                              
                              
                         
                     
                                 
                     
     
  )                   {
    if (
      input.closingDay < 1 ||
      input.closingDay > 31 ||
      input.dueDay < 1 ||
      input.dueDay > 31
    ) {
      throw new ValidationError('Dia de fechamento e vencimento devem estar entre 1 e 31.');
    }
    const now = new Date().toISOString();
    const card                   = {
      id: crypto.randomUUID(),
      userId,
      name: input.name.trim(),
      brand: input.brand || 'Mastercard',
      lastFourDigits: input.lastFourDigits || '0000',
      totalLimitCents: input.totalLimitCents,
      closingDay: input.closingDay,
      dueDay: input.dueDay,
      alertThresholdPct: input.alertThresholdPct ?? 80,
      color: input.color || '#1E293B',
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.creditCards.set(card.id, card);
    return card;
  }

         updateCreditCard(
    userId        ,
    cardId        ,
    updates                                                                                        
  )                   {
    const card = this.creditCards.get(cardId);
    this.assertOwnership(card?.userId, userId, 'CreditCard', cardId);
    if (!card) throw new ForbiddenAccessError();
    if (updates.name !== undefined) card.name = updates.name.trim();
    if (updates.totalLimitCents !== undefined) {
      card.totalLimitCents = updates.totalLimitCents;
    }
    if (updates.closingDay !== undefined) card.closingDay = updates.closingDay;
    if (updates.dueDay !== undefined) card.dueDay = updates.dueDay;
    card.updatedAt = new Date().toISOString();
    return card;
  }

         deleteCreditCard(userId        , cardId        )       {
    const card = this.creditCards.get(cardId);
    this.assertOwnership(card?.userId, userId, 'CreditCard', cardId);
    if (!card) throw new ForbiddenAccessError();
    this.creditCards.delete(cardId);
  }

         getUserCreditCardsWithSummary(
    userId        ,
    referenceMonth = '2026-10'
  )        
                        
                                  
                                         
                                  
                              
                              
     
    {
    const cards = Array.from(this.creditCards.values()).filter(
      (c) => c.userId === userId && !c.isArchived
    );
    const userTx = this.getUserTransactions(userId);
    const userInst = Array.from(this.installments.values()).filter(
      (i) => i.userId === userId && i.status !== 'PAID'
    );

    return cards.map((card) => {
      const currentInvoiceCents = userTx
        .filter(
          (t) =>
            t.creditCardId === card.id &&
            t.occurrenceDate.startsWith(referenceMonth)
        )
        .reduce((acc, t) => acc + t.amountCents, 0);

      const committedInstallmentsCents = userInst
        .filter((i) => i.creditCardId === card.id)
        .reduce((acc, i) => acc + i.amountCents, 0);

      const totalUsed = Math.max(currentInvoiceCents, committedInstallmentsCents);
      const availableLimitCents = Math.max(0, card.totalLimitCents - totalUsed);
      const usagePercentage =
        card.totalLimitCents > 0
          ? Math.round((totalUsed / card.totalLimitCents) * 1000) / 10
          : 0;

      return {
        ...card,
        currentInvoiceCents,
        committedInstallmentsCents: totalUsed,
        availableLimitCents,
        usagePercentage,
        highUsageAlert: usagePercentage >= card.alertThresholdPct,
      };
    });
  }

  // --------------------------------------------------------------------------
  // 4. Gestão de Transações, Classificação Inteligente e Desfazer Exclusão
  // --------------------------------------------------------------------------

         createTransaction(
    userId        ,
    input   
                                      
                          
                             
                              
                                      
                                           
                                   
                          
                                    
                          
                                                         
                                           
                                                   
                                
                      
                     
     
  )   
                                   
                                        
    {
    if (input.amountCents <= 0) {
      throw new ValidationError('O valor da movimentação deve ser maior que zero.');
    }

    const userCategories = Array.from(this.categories.values()).filter(
      (c) => c.userId === userId
    );
    const profile = this.userProfiles.get(userId);
    const learnedRules                         = profile
      ? JSON.parse(profile.learnedCategoryRulesJson || '{}')
      : {};

    let categoryId = input.categoryId;
    let autoClassified = false;

    if (!categoryId) {
      const classified = classifyTransactionDescription({
        description: input.description,
        learnedRules,
        availableCategories: userCategories,
      });
      const matchedCat =
        userCategories.find((c) => c.slug === classified.categorySlug) ||
        userCategories[0];
      categoryId = matchedCat.id;
      autoClassified = true;
    } else {
      const cat = this.categories.get(categoryId);
      this.assertOwnership(cat?.userId, userId, 'Category', categoryId);
    }

    // Detecta pagamento duplicado potencial (mesmo valor, mesma descrição e mesma data)
    const activeUserTx = this.getUserTransactions(userId);
    const potentialDuplicateDetected = activeUserTx.some(
      (t) =>
        t.amountCents === input.amountCents &&
        t.occurrenceDate.slice(0, 10) === input.occurrenceDate.slice(0, 10) &&
        t.description.toLowerCase() === input.description.trim().toLowerCase()
    );

    if (potentialDuplicateDetected) {
      this.createNotification({
        userId,
        type: 'DUPLICATE_PAYMENT_WARNING',
        title: 'Possível lançamento duplicado detectado',
        message: `Identificamos outro lançamento de ${formatBRLFromCents(input.amountCents)} ("${input.description}") na mesma data.`,
      });
    }

    const now = new Date().toISOString();
    const installmentTotal = Math.max(1, input.installmentTotal || 1);

    const tx                    = {
      id: crypto.randomUUID(),
      userId,
      type: input.type,
      amountCents: input.amountCents,
      occurrenceDate: input.occurrenceDate,
      dueDate: input.dueDate || null,
      originAccountId: input.originAccountId || null,
      destinationAccountId: input.destinationAccountId || null,
      creditCardId: input.creditCardId || null,
      categoryId,
      subcategoryId: input.subcategoryId || null,
      description: input.description.trim(),
      paymentMethod: input.paymentMethod || 'PIX',
      status: input.status || 'PAID',
      recurrence: input.recurrence || 'ONCE',
      installmentTotal,
      tags: input.tags || [],
      notes: input.notes || '',
      autoClassified,
      userCorrectedCat: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.transactions.set(tx.id, tx);

    // Atualiza saldos das contas quando status = PAID
    if (tx.status === 'PAID') {
      if (tx.originAccountId) {
        const origin = this.accounts.get(tx.originAccountId);
        if (origin && origin.userId === userId) {
          if (tx.type === 'INCOME') {
            origin.currentBalanceCents += tx.amountCents;
          } else {
            origin.currentBalanceCents -= tx.amountCents;
          }
        }
      }
      if (tx.type === 'TRANSFER' && tx.destinationAccountId) {
        const dest = this.accounts.get(tx.destinationAccountId);
        if (dest && dest.userId === userId) {
          dest.currentBalanceCents += tx.amountCents;
        }
      }
    }

    // Cria parcelas se installmentTotal > 1
    if (installmentTotal > 1) {
      const basePart = Math.floor(tx.amountCents / installmentTotal);
      const remainder = tx.amountCents - basePart * installmentTotal;
      const baseDate = new Date(tx.occurrenceDate);

      for (let i = 1; i <= installmentTotal; i++) {
        const instDate = new Date(baseDate);
        instDate.setUTCMonth(instDate.getUTCMonth() + (i - 1));
        const refMonth = instDate.toISOString().slice(0, 7);
        const instId = crypto.randomUUID();
        this.installments.set(instId, {
          id: instId,
          userId,
          transactionId: tx.id,
          creditCardId: tx.creditCardId,
          installmentNumber: i,
          totalInstallments: installmentTotal,
          amountCents: i === 1 ? basePart + remainder : basePart,
          dueDate: instDate.toISOString(),
          referenceMonth: refMonth,
          status: i === 1 && tx.status === 'PAID' ? 'PAID' : 'PENDING',
          createdAt: now,
        });
      }
    }

    return { transaction: tx, potentialDuplicateDetected };
  }

         updateTransaction(
    userId        ,
    transactionId        ,
    updates           
                          
                          
                         
                                          
                     
                    
      
  )                    {
    const tx = this.transactions.get(transactionId);
    this.assertOwnership(tx?.userId, userId, 'Transaction', transactionId);
    if (!tx) throw new ForbiddenAccessError();

    if (updates.description !== undefined) {
      tx.description = updates.description.trim();
    }
    if (updates.amountCents !== undefined && updates.amountCents > 0) {
      tx.amountCents = updates.amountCents;
    }
    if (updates.status !== undefined) {
      tx.status = updates.status;
    }
    if (updates.tags !== undefined) {
      tx.tags = updates.tags;
    }
    if (updates.notes !== undefined) {
      tx.notes = updates.notes;
    }

    // Se o usuário corrigiu a categoria manualmente, aprende localmente
    if (updates.categoryId && updates.categoryId !== tx.categoryId) {
      const newCat = this.categories.get(updates.categoryId);
      this.assertOwnership(newCat?.userId, userId, 'Category', updates.categoryId);
      if (newCat) {
        tx.categoryId = newCat.id;
        tx.userCorrectedCat = true;
        const profile = this.userProfiles.get(userId);
        if (profile) {
          const currentRules = JSON.parse(profile.learnedCategoryRulesJson || '{}');
          const updatedRules = learnCategoryCorrection(
            currentRules,
            tx.description,
            newCat.slug
          );
          profile.learnedCategoryRulesJson = JSON.stringify(updatedRules);
        }
      }
    }

    tx.updatedAt = new Date().toISOString();
    return tx;
  }

         duplicateTransaction(
    userId        ,
    transactionId        
  )                    {
    const source = this.transactions.get(transactionId);
    this.assertOwnership(source?.userId, userId, 'Transaction', transactionId);
    if (!source) throw new ForbiddenAccessError();

    const { transaction } = this.createTransaction(userId, {
      type: source.type,
      amountCents: source.amountCents,
      occurrenceDate: new Date().toISOString(),
      dueDate: source.dueDate,
      originAccountId: source.originAccountId,
      destinationAccountId: source.destinationAccountId,
      creditCardId: source.creditCardId,
      categoryId: source.categoryId,
      subcategoryId: source.subcategoryId,
      description: `${source.description} (Cópia)`,
      paymentMethod: source.paymentMethod,
      status: 'PENDING',
      recurrence: source.recurrence,
      installmentTotal: 1,
      tags: [...source.tags],
      notes: source.notes,
    });
    return transaction;
  }

         softDeleteTransaction(userId        , transactionId        )       {
    const tx = this.transactions.get(transactionId);
    this.assertOwnership(tx?.userId, userId, 'Transaction', transactionId);
    if (tx) {
      tx.deletedAt = new Date().toISOString();
      this.recordAudit({
        userId,
        action: 'TRANSACTION_SOFT_DELETED',
        resourceType: 'Transaction',
        resourceId: transactionId,
      });
    }
  }

         undoDeleteTransaction(
    userId        ,
    transactionId        
  )                    {
    const tx = this.transactions.get(transactionId);
    this.assertOwnership(tx?.userId, userId, 'Transaction', transactionId);
    if (!tx) throw new ForbiddenAccessError();
    tx.deletedAt = null;
    tx.updatedAt = new Date().toISOString();
    return tx;
  }

         getUserTransactions(
    userId        ,
    filters    
                     
                          
                         
                            
                      
                   
                      
                              
                              
     
  )                      {
    let list = Array.from(this.transactions.values()).filter(
      (t) => t.userId === userId && t.deletedAt === null
    );

    if (filters?.month) {
      list = list.filter((t) => t.occurrenceDate.startsWith(filters.month ));
    }
    if (filters?.categoryId) {
      list = list.filter((t) => t.categoryId === filters.categoryId);
    }
    if (filters?.accountId) {
      list = list.filter(
        (t) =>
          t.originAccountId === filters.accountId ||
          t.destinationAccountId === filters.accountId
      );
    }
    if (filters?.creditCardId) {
      list = list.filter((t) => t.creditCardId === filters.creditCardId);
    }
    if (filters?.status) {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters?.tag) {
      list = list.filter((t) => t.tags.includes(filters.tag ));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (filters?.minAmountCents !== undefined) {
      list = list.filter((t) => t.amountCents >= filters.minAmountCents );
    }
    if (filters?.maxAmountCents !== undefined) {
      list = list.filter((t) => t.amountCents <= filters.maxAmountCents );
    }

    return list.sort(
      (a, b) =>
        new Date(b.occurrenceDate).getTime() -
        new Date(a.occurrenceDate).getTime()
    );
  }

         exportTransactionsCSV(userId        , month         )         {
    const txs = this.getUserTransactions(userId, { month });
    const header =
      'Data;Tipo;Descricao;Categoria;FormaPagamento;Status;ValorBRL;Tags\n';
    const rows = txs.map((t) => {
      const cat = this.categories.get(t.categoryId)?.name || 'Outros';
      const val = (t.amountCents / 100).toFixed(2).replace('.', ',');
      return `${t.occurrenceDate.slice(0, 10)};${t.type};"${t.description.replace(/"/g, '""')}";"${cat}";${t.paymentMethod};${t.status};${val};"${t.tags.join(',')}"`;
    });
    this.recordAudit({
      userId,
      action: 'TRANSACTIONS_EXPORTED_CSV',
      resourceType: 'Transaction',
      metadata: { count: txs.length, month },
    });
    return header + rows.join('\n');
  }

  // --------------------------------------------------------------------------
  // 5. Orçamentos, Metas Financeiras e Dívidas
  // --------------------------------------------------------------------------

         upsertBudget(
    userId        ,
    input   
                         
                                    
                             
                                 
     
  )               {
    const cat = this.categories.get(input.categoryId);
    this.assertOwnership(cat?.userId, userId, 'Category', input.categoryId);

    const existing = Array.from(this.budgets.values()).find(
      (b) =>
        b.userId === userId &&
        b.categoryId === input.categoryId &&
        b.subcategoryId === (input.subcategoryId || null) &&
        b.referenceMonth === input.referenceMonth
    );

    const now = new Date().toISOString();
    if (existing) {
      existing.plannedAmountCents = input.plannedAmountCents;
      existing.updatedAt = now;
      return existing;
    }

    const budget               = {
      id: crypto.randomUUID(),
      userId,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId || null,
      referenceMonth: input.referenceMonth,
      plannedAmountCents: input.plannedAmountCents,
      createdAt: now,
      updatedAt: now,
    };
    this.budgets.set(budget.id, budget);
    return budget;
  }

         getUserBudgets(userId        )                 {
    return Array.from(this.budgets.values()).filter((b) => b.userId === userId);
  }

         updateBudget(
    userId        ,
    budgetId        ,
    updates                                
  )               {
    const budget = this.budgets.get(budgetId);
    this.assertOwnership(budget?.userId, userId, 'Budget', budgetId);
    if (!budget) throw new ForbiddenAccessError();
    budget.plannedAmountCents = updates.plannedAmountCents;
    budget.updatedAt = new Date().toISOString();
    return budget;
  }

         deleteBudget(userId        , budgetId        )       {
    const budget = this.budgets.get(budgetId);
    this.assertOwnership(budget?.userId, userId, 'Budget', budgetId);
    if (!budget) throw new ForbiddenAccessError();
    this.budgets.delete(budgetId);
  }

         createGoal(
    userId        ,
    input   
                   
                                
                                  
                         
                                         
                                        
                                
                    
                     
     
  )             {
    const now = new Date().toISOString();
    const goal             = {
      id: crypto.randomUUID(),
      userId,
      accountId: input.accountId || null,
      name: input.name.trim(),
      targetAmountCents: input.targetAmountCents,
      currentAmountCents: input.currentAmountCents || 0,
      targetDate: input.targetDate,
      recurringContributionCents: input.recurringContributionCents,
      priority: input.priority || 'HIGH',
      icon: input.icon || 'target',
      color: input.color || '#10B981',
      createdAt: now,
      updatedAt: now,
    };
    this.goals.set(goal.id, goal);
    return goal;
  }

         getUserGoals(userId        )               {
    return Array.from(this.goals.values()).filter((g) => g.userId === userId);
  }

         updateGoal(
    userId        ,
    goalId        ,
    updates                                                                                          
  )             {
    const goal = this.goals.get(goalId);
    this.assertOwnership(goal?.userId, userId, 'Goal', goalId);
    if (!goal) throw new ForbiddenAccessError();
    if (updates.name !== undefined) goal.name = updates.name.trim();
    if (updates.targetAmountCents !== undefined) {
      goal.targetAmountCents = updates.targetAmountCents;
    }
    if (updates.recurringContributionCents !== undefined) {
      goal.recurringContributionCents = updates.recurringContributionCents;
    }
    goal.updatedAt = new Date().toISOString();
    return goal;
  }

         deleteGoal(userId        , goalId        )       {
    const goal = this.goals.get(goalId);
    this.assertOwnership(goal?.userId, userId, 'Goal', goalId);
    if (!goal) throw new ForbiddenAccessError();
    this.goals.delete(goalId);
  }

         addGoalContribution(
    userId        ,
    goalId        ,
    amountCents        ,
    note = ''
  )             {
    const goal = this.goals.get(goalId);
    this.assertOwnership(goal?.userId, userId, 'Goal', goalId);
    if (!goal) throw new ForbiddenAccessError();

    goal.currentAmountCents += amountCents;
    goal.updatedAt = new Date().toISOString();

    const contribId = crypto.randomUUID();
    this.goalContributions.set(contribId, {
      id: contribId,
      userId,
      goalId,
      amountCents,
      contributionDate: new Date().toISOString(),
      note,
      createdAt: new Date().toISOString(),
    });

    if (goal.currentAmountCents >= goal.targetAmountCents) {
      this.createNotification({
        userId,
        type: 'GOAL_REACHED',
        title: `Meta atingida: ${goal.name}!`,
        message: `Parabéns! Você atingiu 100% da sua meta "${goal.name}" (${formatBRLFromCents(goal.targetAmountCents)}).`,
      });
    }

    return goal;
  }

         createDebt(
    userId        ,
    input   
                   
                       
                               
                                   
                                    
                                
                                
                                     
                          
                                    
                                                          
     
  )             {
    const now = new Date().toISOString();
    const debt             = {
      id: crypto.randomUUID(),
      userId,
      name: input.name.trim(),
      creditor: input.creditor.trim(),
      totalAmountCents: input.totalAmountCents,
      remainingAmountCents: input.remainingAmountCents,
      monthlyInterestRateBp: input.monthlyInterestRateBp,
      totalInstallments: input.totalInstallments,
      paidInstallments: input.paidInstallments || 0,
      installmentAmountCents: input.installmentAmountCents,
      nextDueDate: input.nextDueDate,
      status: input.status || 'ACTIVE',
      preferredStrategy: input.preferredStrategy || 'AVALANCHE',
      createdAt: now,
      updatedAt: now,
    };
    this.debts.set(debt.id, debt);
    return debt;
  }

  // --------------------------------------------------------------------------
  // 6. Alertas, Notificações e Anexos
  // --------------------------------------------------------------------------

         createNotification(params   
                   
                                     
                  
                    
                              
                          
   )                     {
    const n                     = {
      id: crypto.randomUUID(),
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl || null,
      isRead: false,
      sentByEmail: Boolean(params.sentByEmail),
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(n.id, n);
    return n;
  }

         createAttachment(
    userId        ,
    input   
                            
                       
                       
                            
                             
     
  )                                           {
    const tx = this.transactions.get(input.transactionId);
    this.assertOwnership(tx?.userId, userId, 'Transaction', input.transactionId);

    const id = crypto.randomUUID();
    const att                   = {
      id,
      userId,
      transactionId: input.transactionId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
      sha256Checksum: input.sha256Checksum,
      storageObjectKey: `private/${userId}/${input.transactionId}/${id}`,
      createdAt: new Date().toISOString(),
    };
    this.attachments.set(id, att);

    return {
      ...att,
      signedUrl: createSignedAttachmentUrl(id, userId, 300),
    };
  }

         getUserAttachments(userId        )                     {
    return Array.from(this.attachments.values()).filter(
      (a) => a.userId === userId
    );
  }

         getAttachmentForUser(
    userId        ,
    attachmentId        
  )                                                                 {
    const att = this.attachments.get(attachmentId);
    this.assertOwnership(att?.userId, userId, 'Attachment', attachmentId);
    if (!att) throw new ForbiddenAccessError();
    return {
      ...att,
      bucketName: 'mcf-private-attachments',
      bucketPublic: false,
    };
  }

         deleteAttachment(userId        , attachmentId        )       {
    const att = this.attachments.get(attachmentId);
    this.assertOwnership(att?.userId, userId, 'Attachment', attachmentId);
    if (!att) throw new ForbiddenAccessError();
    this.attachments.delete(attachmentId);
  }

         getStorageBucketConfig()   
                       
                  
                      
                               
                             
    {
    return {
      bucketName: 'mcf-private-attachments',
      public: false,
      rlsEnforced: true,
      allowedMimeTypes: [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/webp',
      ],
      maxFileSizeBytes: 5 * 1024 * 1024,
    };
  }

  // --------------------------------------------------------------------------
  // 7. Dashboard Completo e Relatórios Analíticos
  // --------------------------------------------------------------------------

         getDashboardSummary(userId        , referenceMonth = '2026-10') {
    const user = this.users.get(userId);
    if (!user) throw new ForbiddenAccessError();

    const accounts = this.getUserAccounts(userId);
    const totalBalanceCents = accounts.reduce(
      (sum, a) => sum + a.currentBalanceCents,
      0
    );

    const monthTxs = this.getUserTransactions(userId, { month: referenceMonth });
    const prevMonth = '2026-09';
    const prevMonthTxs = this.getUserTransactions(userId, { month: prevMonth });

    const monthIncomeCents = monthTxs
      .filter((t) => t.type === 'INCOME')
      .reduce((s, t) => s + t.amountCents, 0);

    const monthExpenseCents = monthTxs
      .filter((t) => t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT')
      .reduce((s, t) => s + t.amountCents, 0);

    const monthInvestmentsCents = monthTxs
      .filter((t) => t.type === 'INVESTMENT')
      .reduce((s, t) => s + t.amountCents, 0);

    const prevMonthExpenseCents = prevMonthTxs
      .filter((t) => t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT')
      .reduce((s, t) => s + t.amountCents, 0);

    const monthlyResultCents = monthIncomeCents - monthExpenseCents;
    const savingsRatePercentage =
      monthIncomeCents > 0
        ? Math.round(
            ((monthIncomeCents - monthExpenseCents) / monthIncomeCents) * 1000
          ) / 10
        : 0;

    // Despesas por categoria
    const userCategories = Array.from(this.categories.values()).filter(
      (c) => c.userId === userId
    );
    const expensesByCategory = userCategories
      .map((cat) => {
        const currentCatSpent = monthTxs
          .filter(
            (t) =>
              t.categoryId === cat.id &&
              (t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT')
          )
          .reduce((s, t) => s + t.amountCents, 0);

        const prevCatSpent = prevMonthTxs
          .filter(
            (t) =>
              t.categoryId === cat.id &&
              (t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT')
          )
          .reduce((s, t) => s + t.amountCents, 0);

        const variationPct =
          prevCatSpent > 0
            ? Math.round(((currentCatSpent - prevCatSpent) / prevCatSpent) * 100)
            : 0;

        return {
          categoryId: cat.id,
          categoryName: cat.name,
          slug: cat.slug,
          color: cat.color,
          isFixedCost: cat.isFixedCost,
          spentCents: currentCatSpent,
          prevSpentCents: prevCatSpent,
          variationPct,
          sharePct:
            monthExpenseCents > 0
              ? Math.round((currentCatSpent / monthExpenseCents) * 1000) / 10
              : 0,
        };
      })
      .filter((c) => c.spentCents > 0)
      .sort((a, b) => b.spentCents - a.spentCents);

    // Orçamentos do mês
    const userBudgets = Array.from(this.budgets.values()).filter(
      (b) => b.userId === userId && b.referenceMonth === referenceMonth
    );
    const budgetAnalyses = userBudgets.map((b) => {
      const cat = this.categories.get(b.categoryId);
      const spent = monthTxs
        .filter((t) => t.categoryId === b.categoryId && t.type === 'EXPENSE')
        .reduce((s, t) => s + t.amountCents, 0);
      return analyzeMonthlyBudget({
        categoryId: b.categoryId,
        categoryName: cat?.name || 'Categoria',
        plannedCents: b.plannedAmountCents,
        spentCents: spent,
        currentDayOfMonth: 26,
        daysInMonth: 31,
      });
    });

    const totalPlannedBudgetCents = budgetAnalyses.reduce(
      (s, b) => s + b.plannedCents,
      0
    );
    const totalSpentInBudgetsCents = budgetAnalyses.reduce(
      (s, b) => s + b.spentCents,
      0
    );
    const availableToSpendMonthCents = Math.max(
      0,
      (totalPlannedBudgetCents > 0 ? totalPlannedBudgetCents : monthIncomeCents) -
        monthExpenseCents
    );

    // Metas com projeção
    const userGoals = Array.from(this.goals.values()).filter(
      (g) => g.userId === userId
    );
    const goalProjections = userGoals.map((g) =>
      calculateGoalProjection({
        goalId: g.id,
        name: g.name,
        targetAmountCents: g.targetAmountCents,
        currentAmountCents: g.currentAmountCents,
        recurringContributionCents: g.recurringContributionCents,
        targetDate: g.targetDate,
        referenceDate: new Date('2026-10-26T12:00:00Z'),
      })
    );

    // Próximos vencimentos (pendentes ou agendados)
    const upcomingBills = monthTxs
      .filter((t) => t.status === 'PENDING' || t.status === 'SCHEDULED' || t.status === 'OVERDUE')
      .slice(0, 6);

    // Resumo de cartões de crédito
    const creditCardsSummary = this.getUserCreditCardsWithSummary(
      userId,
      referenceMonth
    );

    // Dívidas e simulação
    const userDebts = Array.from(this.debts.values()).filter(
      (d) => d.userId === userId
    );
    const avalancheSimulation = simulateDebtPayoff(
      userDebts,
      'AVALANCHE',
      30000 // R$ 300,00 extras/mês
    );
    const snowballSimulation = simulateDebtPayoff(
      userDebts,
      'SNOWBALL',
      30000
    );

    // Geração de Insights Financeiros do Dia em linguagem simples
    const dailyInsights           = [];
    const foodCat = expensesByCategory.find((c) => c.slug === 'alimentacao');
    if (foodCat && foodCat.variationPct > 0) {
      dailyInsights.push(
        `Seus gastos com alimentação aumentaram ${foodCat.variationPct}% em relação ao mês passado.`
      );
    }
    for (const b of budgetAnalyses) {
      if (b.percentageUsed >= 80) {
        dailyInsights.push(
          `Você já utilizou ${b.percentageUsed}% do orçamento definido para ${b.categoryName.toLowerCase()}.`
        );
      }
    }
    if (monthlyResultCents < 0) {
      dailyInsights.push(
        'Mantendo esse ritmo, você poderá encerrar o mês com saldo negativo.'
      );
    }
    for (const gp of goalProjections) {
      if (gp.remainingAmountCents > 0 && gp.remainingAmountCents <= 250000) {
        dailyInsights.push(
          `Você está a ${formatBRLFromCents(gp.remainingAmountCents)} de concluir sua meta de ${gp.name.toLowerCase()}.`
        );
      }
    }
    if (dailyInsights.length === 0) {
      dailyInsights.push(
        `Sua taxa de poupança neste mês está em ${savingsRatePercentage}%. Continue acompanhando seus objetivos!`
      );
    }

    const expenseComparisonPrevMonthPct =
      prevMonthExpenseCents > 0
        ? Math.round(
            ((monthExpenseCents - prevMonthExpenseCents) /
              prevMonthExpenseCents) *
              100
          )
        : 0;

    return {
      isDemoAccount: user.isDemoAccount,
      referenceMonth,
      totalBalanceCents,
      monthIncomeCents,
      monthExpenseCents,
      monthInvestmentsCents,
      monthlyResultCents,
      availableToSpendMonthCents,
      savingsRatePercentage,
      expenseComparisonPrevMonthPct,
      expensesByCategory,
      budgetAnalyses,
      goalProjections,
      upcomingBills,
      creditCardsSummary,
      debts: userDebts,
      debtSimulations: {
        avalanche: avalancheSimulation,
        snowball: snowballSimulation,
      },
      dailyInsights,
    };
  }

  // --------------------------------------------------------------------------
  // 8. LGPD e Privacidade (Portabilidade, Consentimentos, Exclusão Segura)
  // --------------------------------------------------------------------------

         exportAllPersonalDataLGPD(
    userId        ,
    format                                    = 'JSON'
  )   
                                           
                                     
    {
    const user = this.users.get(userId);
    if (!user) throw new ForbiddenAccessError();

    const now = new Date().toISOString();
    const reqId = crypto.randomUUID();
    const requestRecord                          = {
      id: reqId,
      userId,
      format,
      status: 'COMPLETED',
      signedDownloadUrl: `/api/v1/privacy/export/${reqId}/download`,
      expiresAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
      requestedAt: now,
      completedAt: now,
    };
    this.dataExportRequests.set(reqId, requestRecord);

    const { passwordHash: _omitted, ...safeUser } = user;
    const payload = {
      lgpdNotice:
        'Relatório de Portabilidade e Acesso aos Dados Pessoais (Art. 18 da Lei nº 13.709/2018 - LGPD)',
      generatedAt: now,
      user: safeUser,
      profile: this.userProfiles.get(userId) || null,
      consents: Array.from(this.consentRecords.values()).filter(
        (c) => c.userId === userId
      ),
      accounts: this.getUserAccounts(userId),
      creditCards: this.getUserCreditCardsWithSummary(userId),
      transactions: this.getUserTransactions(userId),
      budgets: Array.from(this.budgets.values()).filter(
        (b) => b.userId === userId
      ),
      goals: Array.from(this.goals.values()).filter((g) => g.userId === userId),
      debts: Array.from(this.debts.values()).filter((d) => d.userId === userId),
      auditLogs: this.auditLogs.filter((a) => a.userId === userId).slice(0, 100),
    };

    this.recordAudit({
      userId,
      action: 'LGPD_DATA_EXPORTED',
      resourceType: 'DataExportRequest',
      resourceId: reqId,
      metadata: { format },
    });

    return { requestRecord, payload };
  }

         updateConsentPreference(
    userId        ,
    purposeCode        ,
    granted         ,
    ip = '127.0.0.1'
  )                      {
    const existing = Array.from(this.consentRecords.values()).find(
      (c) => c.userId === userId && c.purposeCode === purposeCode
    );
    const now = new Date().toISOString();
    if (existing) {
      existing.granted = granted;
      existing.revokedAt = granted ? null : now;
      existing.ipAddressMasked = maskIpAddress(ip);
      this.recordAudit({
        userId,
        action: granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
        resourceType: 'ConsentRecord',
        resourceId: existing.id,
        ip,
        metadata: { purposeCode, granted },
      });
      return existing;
    }

    const record                      = {
      id: crypto.randomUUID(),
      userId,
      purposeCode,
      purposeTitle: purposeCode,
      policyVersion: '2026.1',
      granted,
      grantedAt: now,
      revokedAt: granted ? null : now,
      ipAddressMasked: maskIpAddress(ip),
    };
    this.consentRecords.set(record.id, record);
    return record;
  }

         requestAccountDeletion(
    userId        ,
    immediatePurge = false
  )                                                       {
    const user = this.users.get(userId);
    if (!user) throw new ForbiddenAccessError();

    const now = new Date();
    const gracePeriodDate = new Date(
      now.getTime() + 15 * 24 * 3600_000
    ).toISOString();

    user.deletionRequestedAt = now.toISOString();
    user.deletionScheduledFor = gracePeriodDate;

    this.revokeAllUserSessions(userId, 'ACCOUNT_DELETION_REQUESTED');

    this.recordAudit({
      userId,
      action: 'ACCOUNT_DELETION_REQUESTED',
      resourceType: 'User',
      resourceId: userId,
      metadata: { immediatePurge, scheduledFor: gracePeriodDate },
    });

    if (immediatePurge) {
      this.purgeUserDataCompletely(userId);
      return { scheduledFor: now.toISOString(), purgedImmediately: true };
    }

    return { scheduledFor: gracePeriodDate, purgedImmediately: false };
  }

         purgeUserDataCompletely(userId        )       {
    this.users.delete(userId);
    this.userProfiles.delete(userId);
    this.mfaConfigs.delete(userId);

    const deleteByOwner =                               (
      map                
    ) => {
      for (const [k, v] of map.entries()) {
        if (v.userId === userId) map.delete(k);
      }
    };

    deleteByOwner(this.sessions);
    deleteByOwner(this.accounts);
    deleteByOwner(this.creditCards);
    deleteByOwner(this.categories);
    deleteByOwner(this.subcategories);
    deleteByOwner(this.transactions);
    deleteByOwner(this.installments);
    deleteByOwner(this.budgets);
    deleteByOwner(this.goals);
    deleteByOwner(this.goalContributions);
    deleteByOwner(this.debts);
    deleteByOwner(this.debtPayments);
    deleteByOwner(this.notifications);
    deleteByOwner(this.notificationPreferences);
    deleteByOwner(this.attachments);
    deleteByOwner(this.consentRecords);
    deleteByOwner(this.dataExportRequests);
  }
}

export const defaultStore = new FinancialPlatformStore();
