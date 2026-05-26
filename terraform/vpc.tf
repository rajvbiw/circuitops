# ─────────────────────────────────────────────────────────────────────────────
# CircuitOps Terraform — Networking VPC Setup
# Set up a secure custom VPC with Public and Private subnets across 2 AZs.
# Required EKS tagging is applied to support automatic AWS ELB creation.
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_vpc" "circuitops" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.cluster_name}-vpc"
    Environment = var.environment
  }
}

# ── Internet Gateway ─────────────────────────────────────────────────────────
resource "aws_internet_gateway" "circuitops" {
  vpc_id = aws_vpc.circuitops.id

  tags = {
    Name        = "${var.cluster_name}-igw"
    Environment = var.environment
  }
}

# ── Subnets (2 Public & 2 Private for high availability) ─────────────────────
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.circuitops.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name                                        = "${var.cluster_name}-public-1a"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
    Environment                                 = var.environment
  }
}

resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.circuitops.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name                                        = "${var.cluster_name}-public-1b"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
    Environment                                 = var.environment
  }
}

resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.circuitops.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name                                        = "${var.cluster_name}-private-1a"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = "1"
    Environment                                 = var.environment
  }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.circuitops.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "${var.aws_region}b"

  tags = {
    Name                                        = "${var.cluster_name}-private-1b"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = "1"
    Environment                                 = var.environment
  }
}

# ── NAT Gateway Setup (For private subnet internet access) ───────────────────
resource "aws_eip" "nat" {
  domain     = "vpc"
  depends_on = [aws_internet_gateway.circuitops]

  tags = {
    Name        = "${var.cluster_name}-nat-eip"
    Environment = var.environment
  }
}

resource "aws_nat_gateway" "circuitops" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_1.id

  tags = {
    Name        = "${var.cluster_name}-nat-gateway"
    Environment = var.environment
  }
}

# ── Route Tables ─────────────────────────────────────────────────────────────
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.circuitops.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.circuitops.id
  }

  tags = {
    Name        = "${var.cluster_name}-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.circuitops.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.circuitops.id
  }

  tags = {
    Name        = "${var.cluster_name}-private-rt"
    Environment = var.environment
  }
}

# ── Route Table Associations ─────────────────────────────────────────────────
resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private_1" {
  subnet_id      = aws_subnet.private_1.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_2" {
  subnet_id      = aws_subnet.private_2.id
  route_table_id = aws_route_table.private.id
}
