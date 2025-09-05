  const loadUserData = async () => {
    try {
      const response = await userProfileService().getUserData();
      if (response.data) {
        setUserData(response.data);
      } else {
        // Fallback para dados do AuthService
        const authData = await AuthService.getUserData();
        if (authData) {
          setUserData(authData);
        } else {
          // Fallback para dados simulados
          setUserData({
            name: 'Usuário',
            email: 'usuario@exemplo.com',
            role: 'PATIENT',
            status: 'READY',
            bio: 'Usuário do Calm Mind',
            crp: null,
            image_url: null,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      // Fallback para dados do AuthService
      try {
        const authData = await AuthService.getUserData();
        if (authData) {
          setUserData(authData);
        } else {
          // Fallback para dados simulados
          setUserData({
            name: 'Usuário',
            email: 'usuario@exemplo.com',
            role: 'PATIENT',
            status: 'READY',
            bio: 'Usuário do Calm Mind',
            crp: null,
            image_url: null,
            created_at: new Date().toISOString()
          });
        }
      } catch (authError) {
        console.error('Erro ao carregar dados do AuthService:', authError);
        // Fallback final para dados simulados
        setUserData({
          name: 'Usuário',
          email: 'usuario@exemplo.com',
          role: 'PATIENT',
          status: 'READY',
          bio: 'Usuário do Calm Mind',
          crp: null,
          image_url: null,
          created_at: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  };
