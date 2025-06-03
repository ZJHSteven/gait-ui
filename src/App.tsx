// src/App.tsx
import React from 'react';
import { Provider as AppProvider } from '@/components/ui/provider';
import {
  Box,
  Flex,
  Heading,
  Container,
  Text,
  Tabs, // Tabs 作为命名空间导入
  Icon,
} from '@chakra-ui/react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';

// 引入一个示例 Logo
import { LuBeaker } from 'react-icons/lu';

// 页面组件 (保持不变，假设它们内部的 Chakra UI 使用是正确的或将在后续处理)
import ExperimentManagementPage from './pages/ExperimentManagementPage';
import ExperimentDataPage from './pages/ExperimentDataPage';

const SettingsPage = () => (
  <Box p={4}>
    <Heading size="lg" mb={4}>系统配置</Heading>
    <Text>这里是配置相关参数的界面。</Text>
  </Box>
);

const AllExperimentsPage = () => (
  <Box p={4}>
    <Heading size="lg" mb={4}>所有实验</Heading>
    <Text>这里展示所有已完成或历史实验的列表。</Text>
  </Box>
);


// 导航项配置
const navItems = [
  { label: '实验操作', path: '/' },
  { label: '历史实验', path: '/experiments' },
  { label: '参数配置', path: '/settings' },
  { label: '其他功能', path: '/other', isDisabled: true },
];

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前路由确定 Tabs 的激活状态，应为字符串类型的 value
  const activeTabValue = navItems.find(item => location.pathname === item.path)?.path || navItems[0].path;

  const handleTabsChange = (newPath: string) => {
    navigate(newPath);
  };

  return (
    <Flex direction="column" minH="100vh" w="100%">
      {/* 顶部 Logo 和标题区域 */}
      <Flex
        as="header"
        align="center"
        paddingX={{ base: 4, md: 8 }}
        paddingY={4}
        borderBottomWidth="1px"
        borderColor="gray.200"
        _dark={{ borderColor: 'gray.700' }} // v3 中 _dark 仍然推荐使用
      >
        <Icon boxSize={8} color="blue.500" mr={3}>
          <LuBeaker />
        </Icon>
        <Heading as="h1" size="lg" fontWeight="semibold">
          步态分析平台
        </Heading>
      </Flex>

      {/* 标签页导航 */}
      <Tabs.Root
        value={activeTabValue} // Tabs.Root 使用 value 控制选中项
        onValueChange={(details) => handleTabsChange(details.value)} // 回调参数是 details 对象，包含 value
        variant="enclosed" // "enclosed-colored" 不是标准 variant，使用 "enclosed"
        colorPalette="blue"
        pt={2}
        px={{ base: 2, md: 6 }}
        borderBottomWidth="1px"
        borderColor="gray.200"
        _dark={{ borderColor: 'gray.700' }}
      >
        <Tabs.List>
          {navItems.map((item) => (
            <Tabs.Trigger
              key={item.path}
              value={item.path} // 每个 Trigger 需要一个 value
              isDisabled={item.isDisabled}
              // Chakra UI v3 中，选中状态样式通过 data-state="active" 属性自动应用，
              // 或通过 recipe/theme 自定义。
              // 如果要强行覆盖，可以使用 css prop：
              css={{
                '&[data-state="active"]': { // (类似用法)
                  color: 'white',
                  backgroundColor: 'var(--chakra-colors-blue-500)', // 使用 CSS 变量确保主题响应
                },
              }}
            >
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {/* 页面内容区域 */}
      <Box flex="1" w="100%" overflowY="auto">
        <Container maxW="container.xl" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }} h="100%">
          <Routes>
            <Route path="/" element={<ExperimentManagementPage />} />
            <Route path="/experiments" element={<AllExperimentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/other" element={<Text>其他功能待开发...</Text>} />
            <Route path="/experiment/:experimentName/data" element={<ExperimentDataPage />} />
          </Routes>
        </Container>
      </Box>

      {/* 页脚 */}
      <Flex
        as="footer"
        align="center"
        justify="center"
        padding={4}
        bg="gray.100" // 推荐使用语义化 token，如 "bg.subtle"
        _dark={{ bg: "gray.700" }} // 语义化 token "bg.subtle" 会自动处理暗黑模式
        color="gray.600" // 推荐使用语义化 token "fg.muted"
        _dark={{ color: "gray.300" }} // "fg.muted" 也会自动处理
        borderTopWidth="1px"
        borderColor="gray.200" // "border"
        _dark={{ borderColor: "gray.700" }} // "border"
      >
        <Text fontSize="sm">
          &copy; {new Date().getFullYear()} 步态分析平台. All rights reserved.
        </Text>
      </Flex>
    </Flex>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;