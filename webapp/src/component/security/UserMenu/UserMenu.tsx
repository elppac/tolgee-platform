import React, { useState } from 'react';
import { IconButton, MenuItem, Popover, styled } from '@mui/material';
import { T, useTranslate } from '@tolgee/react';
import { useSelector } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { container } from 'tsyringe';

import { useConfig } from 'tg.hooks/InitialDataProvider';
import { useUser } from 'tg.hooks/InitialDataProvider';
import { useUserMenuItems } from 'tg.hooks/useUserMenuItems';
import { GlobalActions } from 'tg.store/global/GlobalActions';
import { AppState } from 'tg.store/index';
import { UserAvatar } from 'tg.component/common/avatar/UserAvatar';
import {
  useCurrentOrganization,
  useInitialDataDispatch,
} from 'tg.hooks/InitialDataProvider';
import { LINKS, PARAMS } from 'tg.constants/links';
import { components } from 'tg.service/apiSchema.generated';

import { MenuHeader } from './MenuHeader';
import { OrganizationSwitch } from './OrganizationSwitch';

type OrganizationModel = components['schemas']['OrganizationModel'];

const globalActions = container.resolve(GlobalActions);

const StyledIconButton = styled(IconButton)`
  width: 40px;
  height: 40px;
`;

const StyledPopover = styled(Popover)`
  & .paper {
    border: 1px solid #d3d4d5;
    margin-top: 5px;
    padding: 2px 0px;
    max-width: 300px;
  }
`;

const StyledDivider = styled('div')`
  height: 1px;
  background: ${({ theme }) => theme.palette.emphasis[300]};
`;

export const UserMenu: React.FC = () => {
  const userLogged = useSelector(
    (state: AppState) => state.global.security.allowPrivate
  );
  const organization = useCurrentOrganization();
  const t = useTranslate();
  const config = useConfig();
  const location = useLocation();
  const initialDataDispatch = useInitialDataDispatch();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState(null);
  const user = useUser();
  const userMenuItems = useUserMenuItems();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    //@ts-ignore
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectOrganization = (organization: OrganizationModel) => {
    initialDataDispatch({ type: 'UPDATE_ORGANIZATION', payload: organization });
    setAnchorEl(null);
    history.push(LINKS.PROJECTS.build());
  };

  const handleCreateNewOrganization = () => {
    setAnchorEl(null);
    history.push(LINKS.ORGANIZATIONS_ADD.build());
  };

  if (!config.authentication || !user || !organization) {
    return null;
  }

  const organizationItems: { link: string; label: string }[] = [];

  if (organization.currentUserRole === 'OWNER') {
    organizationItems.push({
      link: LINKS.ORGANIZATION_PROFILE.build({
        [PARAMS.ORGANIZATION_SLUG]: organization?.slug,
      }),
      label: t('user_menu_organization_settings'),
    });

    if (config.billing.enabled) {
      organizationItems.push({
        link: LINKS.ORGANIZATION_BILLING.build({
          [PARAMS.ORGANIZATION_SLUG]: organization?.slug,
        }),
        label: t('organization_menu_billing'),
      });
    }
  }

  const organizationMenuItems = organizationItems.map((i) => ({
    ...i,
    isSelected: location.pathname === i.link,
  }));

  return userLogged ? (
    <div>
      <StyledIconButton
        color="inherit"
        data-cy="global-user-menu-button"
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleOpen}
        size="large"
      >
        <UserAvatar />
      </StyledIconButton>
      <StyledPopover
        id="user-menu"
        keepMounted
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        elevation={0}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: 'paper' }}
      >
        <MenuHeader
          entity={user}
          type="USER"
          title={user.name}
          subtitle={user.username}
        />
        {userMenuItems.map((item, index) => (
          <MenuItem
            key={index}
            component={Link}
            to={item.link}
            selected={item.isSelected}
            onClick={handleClose}
          >
            {item.label}
          </MenuItem>
        ))}
        {organization && (
          <>
            <StyledDivider />
            <MenuHeader
              entity={organization}
              type="ORG"
              title={organization.name}
              subtitle={organization.description}
            />
            {organizationMenuItems.map((item, index) => (
              <MenuItem
                key={index}
                component={Link}
                to={item.link}
                selected={item.isSelected}
                onClick={handleClose}
              >
                {item.label}
              </MenuItem>
            ))}
            <OrganizationSwitch
              onSelect={handleSelectOrganization}
              onCreateNew={handleCreateNewOrganization}
            />
          </>
        )}
        <StyledDivider />
        <MenuItem onClick={() => globalActions.logout.dispatch()} divider>
          <T>user_menu_logout</T>
        </MenuItem>
      </StyledPopover>
    </div>
  ) : null;
};
